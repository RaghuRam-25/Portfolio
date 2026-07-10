const express = require('express');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { userCreateSchema, userUpdateSchema } = require('../middleware/validators');
const {
  listUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
} = require('../controllers/adminUserController');

const router = express.Router();

router.get('/', protect, adminOnly, listUsers);
router.post('/', protect, adminOnly, validate(userCreateSchema), createUser);
router.get('/:id', protect, adminOnly, getUser);
router.put('/:id', protect, adminOnly, validate(userUpdateSchema), updateUser);
router.delete('/:id', protect, adminOnly, deleteUser);
router.patch('/:id/block', protect, adminOnly, blockUser);
router.patch('/:id/unblock', protect, adminOnly, unblockUser);

router.put('/:id/role', protect, adminOnly, async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified. Role must be "user" or "admin".' });
    }

    if (req.user.id === req.params.id && role === 'user') {
      return res.status(400).json({ success: false, message: 'You cannot remove your own admin privileges.' });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { role },
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -emailVerificationExpires');

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User role updated successfully.', data: user });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/set-portfolio', protect, adminOnly, async (req, res, next) => {
  try {
    const userToSet = await User.findOne({ _id: req.params.id, deletedAt: null });
    if (!userToSet) return res.status(404).json({ success: false, message: 'User not found.' });

    await User.updateMany({ _id: { $ne: req.params.id } }, { isPortfolioProfile: false });
    userToSet.isPortfolioProfile = true;
    await userToSet.save();

    res.json({ success: true, message: `${userToSet.name} is now the main portfolio profile.` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
