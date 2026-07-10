const express = require('express');
const router = express.Router();
const { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } = require('../controllers/testimonialController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public route
router.get('/', getTestimonials);

// Admin routes
router.post('/', protect, adminOnly, upload.single('clientImage'), createTestimonial);
router.put('/:id', protect, adminOnly, upload.single('clientImage'), updateTestimonial);
router.delete('/:id', protect, adminOnly, deleteTestimonial);

module.exports = router;