const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { buildPagination, buildTextSearch, parseSort } = require('../utils/apiFeatures');
const { ok, created } = require('../utils/responses');

const publicFields = '-password -emailVerificationToken -emailVerificationExpires';

exports.listUsers = asyncHandler(async (req, res) => {
  const filter = { deletedAt: null, ...buildTextSearch(req.query, ['name', 'email', 'role']) };
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isBlocked !== undefined) filter.isBlocked = req.query.isBlocked === 'true';

  const pagination = await buildPagination(User, filter, req.query);
  const users = await User.find(filter)
    .select(publicFields)
    .sort(parseSort(req.query))
    .skip(pagination.skip)
    .limit(pagination.limit);

  ok(res, users, 'Users list', 200, {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    pages: pagination.pages,
  });
});

exports.createUser = asyncHandler(async (req, res) => {
  const exists = await User.findOne({ email: req.body.email, deletedAt: null });
  if (exists) return res.status(409).json({ success: false, message: 'Email already exists' });

  const user = await User.create({ ...req.body, provider: 'local', isVerified: req.body.isVerified ?? true });
  const clean = await User.findById(user._id).select(publicFields);
  created(res, clean, 'User created');
});

exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, deletedAt: null }).select(publicFields);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  ok(res, user, 'User detail');
});

exports.updateUser = asyncHandler(async (req, res) => {
  if (req.user.id === req.params.id && req.body.role === 'user') {
    return res.status(400).json({ success: false, message: 'You cannot remove your own admin privileges.' });
  }

  const user = await User.findOne({ _id: req.params.id, deletedAt: null }).select('+password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  Object.assign(user, req.body);
  if (req.body.isBlocked === true && !user.blockedAt) user.blockedAt = new Date();
  if (req.body.isBlocked === false) user.blockedAt = null;
  await user.save();

  const clean = await User.findById(user._id).select(publicFields);
  ok(res, clean, 'User updated');
});

exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
  }

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  ok(res, null, 'User deleted');
});

exports.blockUser = asyncHandler(async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ success: false, message: 'You cannot block your own account.' });
  }

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, deletedAt: null },
    { isBlocked: true, blockedAt: new Date() },
    { new: true }
  ).select(publicFields);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  ok(res, user, 'User blocked');
});

exports.unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, deletedAt: null },
    { isBlocked: false, blockedAt: null },
    { new: true }
  ).select(publicFields);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  ok(res, user, 'User unblocked');
});
