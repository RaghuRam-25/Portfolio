const { ok } = require('../utils/responses');

exports.uploadSingle = (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
  ok(res, { url: req.file.path.replace(/\\/g, '/') }, 'File uploaded', 201);
};

exports.uploadMultiple = (req, res) => {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ success: false, message: 'No files uploaded.' });
  ok(res, files.map((file) => ({ url: file.path.replace(/\\/g, '/') })), 'Files uploaded', 201);
};
