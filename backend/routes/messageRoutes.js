const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const sendEmail = require('../models/sendEmail');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// ============================================================
// POST /api/messages — Public contact form submit (DB তে সেভ)
// ============================================================
router.post('/', async (req, res) => {
  try {
    const { senderName, senderEmail, message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message field is required.' });
    }

    const newMessage = await Message.create({
      senderName: DOMPurify.sanitize(senderName),
      senderEmail: DOMPurify.sanitize(senderEmail),
      message: DOMPurify.sanitize(message),
      type: 'public',
    });

    // রিয়েল-টাইম নোটিফিকেশনের জন্য ইভেন্ট এমিট করা
    if (req.app.get('io')) {
      req.app.get('io').emit('newMessage', newMessage);
    }

    res.status(201).json({ success: true, message: 'Message received!', data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// POST /api/messages/secure — Secure Portal (লগইন আবশ্যক)
// ============================================================
router.post('/secure', protect, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }

    const newMessage = await Message.create({
      senderName: req.user.name,
      senderEmail: req.user.email,
      message: DOMPurify.sanitize(message),
      userId: req.user._id,
      type: 'secure',
    });

    // রিয়েল-টাইম নোটিফিকেশনের জন্য ইভেন্ট এমিট করা
    if (req.app.get('io')) {
      req.app.get('io').emit('newMessage', newMessage);
    }

    res.status(201).json({ success: true, message: 'Secure message sent!', data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// GET /api/messages/sent — ব্যবহারকারীর পাঠানো মেসেজ দেখা (লগইন আবশ্যক)
// ============================================================
router.get('/sent', protect, async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'replies.repliedBy',
        select: 'name role avatarUrl'
      });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// GET /api/messages/payment-confirmations — Admin-এর জন্য পেমেন্ট কনফার্মেশন দেখা
// ============================================================
router.get('/payment-confirmations', protect, adminOnly, async (req, res) => {
  try {
    const messages = await Message.find({ isPaymentConfirmation: true }).sort({ createdAt: -1 }).populate('userId', 'name email avatarUrl');
    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// PATCH /api/messages/:id/read — Message read mark করা (Admin)
// ============================================================
router.patch('/:id/read', protect, adminOnly, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    if (!msg.isRead) {
      msg.isRead = true;
      await msg.save();

      // রিয়েল-টাইম "seen" স্ট্যাটাস পাঠানোর জন্য
      const io = req.app.get('io');
      if (io && msg.userId) {
        io.to(msg.userId.toString()).emit('messageSeen', { messageId: msg._id });
      }
    }
    res.json({ success: true, data: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// DELETE /api/messages/:id — Message delete করা (Admin)
// ============================================================
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// POST /api/messages/payment-confirmation — Payment Confirmation (লগইন আবশ্যক)
// ============================================================
router.post('/payment-confirmation', protect, async (req, res) => {
  try {
    const { transactionId, message, amount, projectType } = req.body;

    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'Transaction ID is required.' });
    }

    const sanitizedTransactionId = DOMPurify.sanitize(transactionId);
    const sanitizedMessage = message ? DOMPurify.sanitize(message) : null;
    const sanitizedProjectType = projectType ? DOMPurify.sanitize(projectType) : undefined;

    const newMessage = await Message.create({
      senderName: req.user.name,
      senderEmail: req.user.email,
      message: sanitizedMessage || `Payment confirmation with ID: ${sanitizedTransactionId}`,
      userId: req.user._id,
      type: 'secure', // All payment confirmations are secure
      isPaymentConfirmation: true,
      transactionId: sanitizedTransactionId,
      amount: amount,
      projectType: sanitizedProjectType,
    });

    // নতুন পেমেন্ট কনফার্মেশনের জন্য রিয়েল-টাইম নোটিফিকেশন
    if (req.app.get('io')) {
      req.app.get('io').emit('newPaymentConfirmation', newMessage);
    }

    // Find portfolio owner for email signature
    const portfolioOwner = await User.findOne({ isPortfolioProfile: true });

    // Send confirmation email to the user
    try {
      const subject = `Payment Confirmation Received`;
      const htmlMessage = `
        <p>Hello ${req.user.name},</p>
        <p>Thank you for your payment confirmation. We have received your submission with the following details:</p>
        <ul>
          <li><strong>Transaction ID:</strong> ${sanitizedTransactionId}</li>
          ${amount ? `<li><strong>Amount:</strong> $${amount}</li>` : ''}
          <li><strong>Message:</strong> ${sanitizedMessage || 'N/A'}</li>
        </ul>
        <p>We will review it shortly and get back to you if needed.</p>
        <p>Best regards,<br>${portfolioOwner ? portfolioOwner.name : 'The Team'}</p>
      `;

      await sendEmail({ email: req.user.email, subject, html: htmlMessage });
      res.status(201).json({ success: true, message: 'Payment confirmation received and email sent!', data: newMessage });
    } catch (emailError) {
      console.error('Payment confirmation email sending failed:', emailError);
      // Even if email fails, the confirmation was received.
      res.status(201).json({ success: true, message: 'Payment confirmation received, but failed to send confirmation email.', data: newMessage });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// POST /api/messages/:id/user-reply — ব্যবহারকারীর রিপ্লাই পাঠানো (লগইন আবশ্যক)
// ============================================================
router.post('/:id/user-reply', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const originalMessage = await Message.findById(req.params.id);

    if (!originalMessage) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    // ইউজার আইডি অস্তিত্বহীন হলে বা মিল না থাকলে অথোরাইজেশন ব্যর্থ হবে
    if (!originalMessage.userId || originalMessage.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to reply to this message.' });
    }

    if (!message) {
      return res.status(400).json({ success: false, message: 'Reply message cannot be empty.' });
    }

    originalMessage.replies.push({ message: DOMPurify.sanitize(message), repliedBy: req.user._id });
    originalMessage.isRead = false; // Mark as unread for admin
    await originalMessage.save();

    const updatedMessage = await Message.findById(originalMessage._id).populate({ path: 'replies.repliedBy', select: 'name role avatarUrl' }).populate('userId', 'name email avatarUrl');

    if (req.app.get('io')) {
      req.app.get('io').emit('newReply', updatedMessage);
    }

    res.json({ success: true, message: 'Reply sent successfully!', data: updatedMessage });
  } catch (error) {
    console.error('Failed to send reply:', error);
    res.status(500).json({ success: false, message: 'Failed to send reply. Please try again later.' });
  }
});

module.exports = router;
