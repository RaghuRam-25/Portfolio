const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../models/sendEmail'); // sendEmail utility
const { registerSchema } = require('../middleware/validators');

const resolveUrl = (path, req) => {
    if (!path || path.startsWith('http')) return path;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const normalizedPath = path.replace(/\\/g, '/');
    return `${baseUrl}/${normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath}`;
};

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
        // ইমেইল পাঠাতে ব্যর্থ হলে সদ্য তৈরি হওয়া ইউজার রোলব্যাক করা হয়,
        // যাতে ইমেইলটি "নেওয়া" অবস্থায় আটকে না থাকে (M6)।
        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify Your Email for Your Portfolio Account',
                html: emailHtml,
            });
        } catch (mailError) {
            await User.deleteOne({ _id: user._id });
            return res.status(502).json({
                success: false,
                message: 'Could not send the verification email. Please try registering again shortly.',
            });
        }

        res.status(201).json({ success: true, message: 'Registration successful! Please check your email for verification.', user: { _id: user._id, name: user.name, email: user.email } });

    } catch (error) {
        // Zod এর এরর হ্যান্ডল করা — Zod 4-এ issues property ব্যবহার হয় (errors নয়)
        if (error.name === 'ZodError') {
            const issues = error.issues || error.errors || [];
            return res.status(400).json({ success: false, errors: issues.map(e => e.message) });
        }
        // ডুপ্লিকেট কী (E11000) কে পরিষ্কার 409 হিসেবে রিপোর্ট করা হয় (M3)
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
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
            avatarUrl: resolveUrl(user.avatarUrl, req),
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
        // req.user না থাকলে (স্ট্র্যাটেজি ব্যর্থ) নিরাপদে ফ্রন্টএন্ডে এরর সহ ফেরত পাঠানো হয়
        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL}/auth-portal?verificationError=true`);
        }

        // ব্লক করা ইউজারকে কোনো টোকেন দেওয়া হয় না (M7)
        if (req.user.isBlocked) {
            return res.redirect(`${process.env.FRONTEND_URL}/auth-portal?verificationError=blocked`);
        }

        const token = generateToken(req.user._id);
        const { _id, name, email, avatarUrl, role } = req.user;

        // ফ্রন্টএন্ডের চাহিদা অনুযায়ী টোকেন এবং ইউজার ডেটা Query Parameter হিসাবে পাঠানো হচ্ছে
        const redirectPath = role === 'admin' ? '/admin' : '/contact';
        const queryParams = new URLSearchParams({
            token,
            name,
            email,
            _id: _id.toString(),
            avatarUrl: resolveUrl(avatarUrl, req) || '',
            role: role || 'user'
        }).toString();

        // ইউজারকে ফ্রন্টএন্ডে রিডাইরেক্ট করা, সাথে লগইন ডেটা সহ
        res.redirect(`${process.env.FRONTEND_URL}${redirectPath}?${queryParams}`);
    } catch (error) {
        next(error);
    }
};
