const PageContent = require('../models/PageContent');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/responses');

exports.getPageContent = asyncHandler(async (req, res) => {
  const content = await PageContent.findOne({ key: req.params.key, deletedAt: null });
  ok(res, content || { key: req.params.key, title: '', content: {} }, 'Page content');
});

exports.upsertPageContent = asyncHandler(async (req, res) => {
  const content = await PageContent.findOneAndUpdate(
    { key: req.params.key },
    { ...req.body, key: req.params.key, updatedBy: req.user._id, deletedAt: null },
    { new: true, upsert: true, runValidators: true }
  );
  ok(res, content, 'Page content updated');
});
