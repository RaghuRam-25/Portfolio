const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { register, login, oauthCallback, verifyEmail } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

// OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', {
  session: false,
  failureRedirect: `${process.env.FRONTEND_URL || ''}/auth-portal?verificationError=oauth`,
}), oauthCallback);
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', {
  session: false,
  failureRedirect: `${process.env.FRONTEND_URL || ''}/auth-portal?verificationError=oauth`,
}), oauthCallback);

// Email Verification
router.get('/verify-email/:token', verifyEmail);

router.get('/me', protect, (req, res) => {
    res.json({ success: true, user: req.user });
});

// POST /api/auth/logout
router.post('/logout', (req, res, next) => {
    // passport v0.6.0+ অনুযায়ী req.logout() একটি অ্যাসিঙ্ক্রোনাস ফাংশন
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        // সেশন ডেস্ট্রয় করা
        req.session.destroy((err) => {
            if (err) { return res.status(500).json({ success: false, message: 'Could not log out, please try again.' }); }
            res.clearCookie('connect.sid'); // 'connect.sid' হলো express-session এর ডিফল্ট কুকি নাম
            return res.status(200).json({ success: true, message: 'Logged out successfully.' });
        });
    });
});

module.exports = router;
