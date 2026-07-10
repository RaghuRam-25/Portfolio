const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Message = require('../models/Message');
const User = require('../models/User'); // Profile মডেলের পরিবর্তে User মডেল
const ChatSession = require('../models/ChatSession');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET /api/summary - Get dashboard summary stats
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const projectCount = await Project.countDocuments();
        const userCount = await User.countDocuments();
        const paymentConfirmationCount = await Message.countDocuments({ isPaymentConfirmation: true });
        const activeChatCount = await ChatSession.countDocuments({ isArchived: false });

        // পোর্টফোলিও প্রোফাইল থেকে ভিডিও সংখ্যা নেওয়া হচ্ছে (শুধুমাত্র ভেরিফাইড ইউজার)
        const adminProfile = await User.findOne({ isPortfolioProfile: true, isVerified: true });
        const videoCount = adminProfile?.videos?.length || 0;

        res.json({
            success: true,
            data: {
                projects: projectCount,
                videos: videoCount,
                users: userCount,
                paymentConfirmations: paymentConfirmationCount,
                activeChats: activeChatCount,
            },
        });
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.get('/project-plan-stats', protect, adminOnly, async (req, res) => {
    try {
        const adminProfile = await User.findOne({ isPortfolioProfile: true, deletedAt: null });
        const projectTypes = adminProfile?.projectEstimator?.projectTypes || [];
        const features = adminProfile?.projectEstimator?.features || [];

        res.json({
            success: true,
            data: {
                projectTypes: projectTypes.map(item => ({
                    id: item.id,
                    name: item.name,
                    basePrice: item.basePrice,
                    baseDays: item.baseDays,
                })),
                features: features.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    days: item.days,
                })),
                totals: {
                    projectTypes: projectTypes.length,
                    features: features.length,
                    maxBasePrice: projectTypes.reduce((max, item) => Math.max(max, item.basePrice || 0), 0),
                    averageBaseDays: projectTypes.length
                        ? Math.round(projectTypes.reduce((sum, item) => sum + (item.baseDays || 0), 0) / projectTypes.length)
                        : 0,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching project plan stats:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
