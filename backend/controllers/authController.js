const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../models/sendEmail'); // sendEmail utility
const { registerSchema } = require('../middleware/validators');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// Register Controller
exports.register = async (req, res, next) => {
    try {
        // Zod দিয়ে ভ্যালিডেশন
        const validatedData = registerSchema.parse(req.body);

        // ভ্যালিডেশন সফল হলে বাকি লজিক
        const { name, email, password } = validatedData;

        const existingUser = await User.findOne({ email, deletedAt: null });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে।' });
        }

        // Generate email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpires = Date.now() + 3600000; // 1 hour from now

        // Check if this is the first user, or if there's no existing portfolio profile
        const existingUsersCount = await User.countDocuments();
        const existingPortfolioProfile = await User.findOne({ isPortfolioProfile: true });

        const isPortfolioProfile = existingUsersCount === 0 || !existingPortfolioProfile; // First user becomes admin and portfolio profile

        const user = await User.create({
            name,
            email,
            password,
            provider: 'local',
            role: isPortfolioProfile ? 'admin' : 'user',
            isPortfolioProfile,
            emailVerificationToken,
            emailVerificationExpires,
            isVerified: false, // New users are unverified by default
        });

        // Send verification email
        // The URL must point to the backend verification endpoint.
        const backendApiUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        const verificationUrl = `${backendApiUrl}/api/auth/verify-email/${emailVerificationToken}`;
        const emailHtml = `
            <p>Hello ${name},</p>
            <p>Please verify your email by clicking on this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This link will expire in 1 hour.</p>
        `;
        await sendEmail({
            email: user.email,
            subject: 'Verify Your Email for Your Portfolio Account',
            html: emailHtml,
        });

        res.status(201).json({ success: true, message: 'Registration successful! Please check your email for verification.', user: { _id: user._id, name: user.name, email: user.email } });

    } catch (error) {
        // Zod এর এরর হ্যান্ডল করা
        if (error.name === 'ZodError') {
            return res.status(400).json({ success: false, errors: error.errors.map(e => e.message) });
        }
        next(error);
    }
};

// Email Verification Controller
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/auth-portal?verificationError=true`);
        }

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.redirect(`${process.env.FRONTEND_URL}/auth-portal?verificationSuccess=true`);

    } catch (error) {
        console.error('Email verification error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/auth-portal?verificationError=true`);
    }
};

// Login Controller
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, provider: 'local', deletedAt: null }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: 'Your account has been blocked.' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ success: false, message: 'Please verify your email to log in.' });
        }

        const token = generateToken(user._id);

        // নিরাপত্তা নিশ্চিত করার জন্য পাসওয়ার্ড বাদ দিয়ে রেসপন্স পাঠানো হচ্ছে
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            role: user.role,
            isPortfolioProfile: user.isPortfolioProfile,
            isVerified: user.isVerified,
        };

        res.json({ success: true, token, user: userResponse });
    } catch (error) {
        next(error);
    }
};

// OAuth Callback Controller
exports.oauthCallback = (req, res, next) => {
    try {
        const token = generateToken(req.user._id);
        const { _id, name, email, avatarUrl, role } = req.user;

        // ফ্রন্টএন্ডের চাহিদা অনুযায়ী টোকেন এবং ইউজার ডেটা Query Parameter হিসাবে পাঠানো হচ্ছে
        const redirectPath = role === 'admin' ? '/admin' : '/contact';
        const queryParams = new URLSearchParams({
            token,
            name,
            email,
            _id: _id.toString(),
            avatarUrl: avatarUrl || '',
            role: role || 'user'
        }).toString();

        // ইউজারকে ফ্রন্টএন্ডে রিডাইরেক্ট করা, সাথে লগইন ডেটা সহ
        res.redirect(`${process.env.FRONTEND_URL}${redirectPath}?${queryParams}`);
    } catch (error) {
        next(error);
    }
};
