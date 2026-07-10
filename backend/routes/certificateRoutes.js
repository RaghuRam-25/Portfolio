const express = require('express');
const router = express.Router();
const { getCertificates, createCertificate, updateCertificate, deleteCertificate } = require('../controllers/certificateController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public route
router.get('/', getCertificates);

// Admin routes
router.post('/', protect, adminOnly, upload.single('certificateImage'), createCertificate);
router.put('/:id', protect, adminOnly, upload.single('certificateImage'), updateCertificate);
router.delete('/:id', protect, adminOnly, deleteCertificate);

module.exports = router;