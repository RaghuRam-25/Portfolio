const express = require('express');
const router = express.Router();
const {
    getEducation,
    createEducation,
    updateEducation,
    deleteEducation,
} = require('../controllers/educationController');

// This path might need to be adjusted based on your project structure.
// Assuming you have this middleware for authentication.
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   GET /api/education
// @access  Public
router.route('/').get(getEducation);

// @route   POST /api/education
// @access  Admin
router.route('/').post(protect, adminOnly, createEducation);

// @route   PUT /api/education/:id
// @route   DELETE /api/education/:id
// @access  Admin
router.route('/:id')
    .put(protect, adminOnly, updateEducation)
    .delete(protect, adminOnly, deleteEducation);

module.exports = router;