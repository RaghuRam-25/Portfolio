const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { uploadSingle, uploadMultiple } = require('../controllers/uploadController');

const router = express.Router();

router.post('/single', protect, adminOnly, upload.single('file'), uploadSingle);
router.post('/multiple', protect, adminOnly, upload.array('files', 10), uploadMultiple);

module.exports = router;
