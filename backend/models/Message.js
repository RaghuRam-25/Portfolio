const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  message: { type: String, required: true },
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  senderName: { type: String },
  senderEmail: { type: String },
  message: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['public', 'secure'], default: 'public' },
  isRead: { type: Boolean, default: false },
  replies: [replySchema],
  isPaymentConfirmation: { type: Boolean, default: false },
  transactionId: { type: String, default: null },
  amount: { type: Number },
  projectType: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);