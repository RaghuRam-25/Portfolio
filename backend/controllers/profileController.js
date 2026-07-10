const User = require('../models/User');

// @desc    Get the main portfolio profile for public view
// @route   GET /api/profile
// @access  Public
const getPublicProfile = async (req, res) => {
    try {
        // Find the user designated as the portfolio profile
        // Exclude sensitive data like password, role, etc.
        const profile = await User.findOne({ isPortfolioProfile: true }).select(
            '-password -role -emailVerificationToken -emailVerificationExpires -provider -providerId -isVerified'
        );

        if (!profile) {
            // আরও তথ্যপূর্ণ এরর মেসেজ, যা অ্যাডমিনকে সঠিক পদক্ষেপ নিতে সাহায্য করবে
            return res.status(404).json({ success: false, message: 'Portfolio profile not found. Please set a user as the main portfolio profile in the admin panel.' });
        }

        res.json({ success: true, data: profile });
    } catch (error) {
        console.error('Error fetching public profile:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update the main portfolio profile
// @route   PUT /api/profile
// @access  Admin
const updateProfile = async (req, res) => {
    try {
        const profile = await User.findOne({ isPortfolioProfile: true });

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Portfolio profile to update not found. Please set a user as the main portfolio profile in the admin panel.' });
        }

        // Define all fields that are allowed to be updated via this route.
        const allowedUpdates = [
            'name', 'title', 'bio', 'socials', 'stats', 'skills', 'avatarUrl',
            'videos', 'paymentMethods', 'projectEstimator', 'websiteSettings',
            'heroSection', 'aboutSection', 'contactInfo', 'seoSettings',
            'themeSettings', 'navigation', 'sectionVisibility', 'projectSection',
            'videoSection', 'certificateSection', 'educationSection', 'testimonialSection', 'estimatorSection',
            'careerStartDate'
        ];

        // Loop through the request body and update only the allowed fields.
        // This is more scalable and secure than individual 'if' statements.
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                // Using `hasOwnProperty` ensures we can set fields to null or empty arrays.
                if (req.body.hasOwnProperty(key)) {
                    profile[key] = req.body[key];
                }
            }
        });

        const updatedProfile = await profile.save();

        // Exclude sensitive data from the response
        const responseData = updatedProfile.toObject();
        delete responseData.password;
        delete responseData.role;
        delete responseData.emailVerificationToken;
        delete responseData.emailVerificationExpires;
        delete responseData.provider;
        delete responseData.providerId;

        res.json({
            success: true,
            message: 'Profile updated successfully.',
            data: responseData
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getPublicProfile,
    updateProfile,
};
