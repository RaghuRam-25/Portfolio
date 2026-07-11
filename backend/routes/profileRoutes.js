const express = require('express');
const router = express.Router();
const path = require('path');
const { getPublicProfile, updateProfile } = require('../controllers/profileController');
const { protect, adminOnly } = require('../middleware/authMiddleware'); // Assuming these middlewares exist for security
const { upload } = require('../middleware/uploadMiddleware');

// H6 fix: Cloudinary URL হলে অপরিবর্তিত; নয়তো আপেক্ষিক uploads/<file> path
const toPublicUploadPath = (filePath) => {
    if (/^https?:\/\//i.test(filePath)) return filePath;
    return `uploads/${path.basename(filePath)}`;
};

// @route   GET /api/profile
// Public route to get the portfolio data for anyone visiting the site.
router.get('/', getPublicProfile);

router.post('/upload', protect, adminOnly, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    res.status(201).json({
        success: true,
        data: { url: toPublicUploadPath(req.file.path) },
    });
});

// @route   PUT /api/profile
// Protected admin route to update the portfolio data.
router.put('/', protect, adminOnly, updateProfile);

module.exports = router;
