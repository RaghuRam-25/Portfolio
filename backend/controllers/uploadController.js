const path = require('path');
const { ok } = require('../utils/responses');

// H6 fix: Cloudinary URL হলে অপরিবর্তিত; নয়তো আপেক্ষিক uploads/<file> path
const toPublicUploadPath = (filePath) => {
  if (/^https?:\/\//i.test(filePath)) return filePath;
  return `uploads/${path.basename(filePath)}`;
};

exports.uploadSingle = (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
  ok(res, { url: toPublicUploadPath(req.file.path) }, 'File uploaded', 201);
};

exports.uploadMultiple = (req, res) => {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ success: false, message: 'No files uploaded.' });
  ok(res, files.map((file) => ({ url: toPublicUploadPath(file.path) })), 'Files uploaded', 201);
};
