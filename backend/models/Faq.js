const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true },
  category: { type: String, default: 'general' },
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

faqSchema.index({ question: 'text', answer: 'text' });

module.exports = mongoose.model('Faq', faqSchema);
