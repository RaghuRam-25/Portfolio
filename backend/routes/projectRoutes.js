const express = require('express');
const router = express.Router();
const { getProjects, createProject, getProjectById, updateProject, deleteProject } = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware'); // Assuming you have a multer-based upload middleware

// Public routes
router.get('/', getProjects);
router.get('/featured', async (req, res) => {
  try {
    const Project = require('../models/Project');
    const projects = await Project.find({ isFeatured: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});
router.get('/:id', getProjectById);

// Admin routes (protected and adminOnly)
router.post('/', protect, adminOnly, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 10 } // Max 10 gallery images
]), createProject);
router.put('/:id', protect, adminOnly, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), updateProject);
router.delete('/:id', protect, adminOnly, deleteProject);

module.exports = router;
