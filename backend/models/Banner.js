const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  linkUrl: { type: String, default: '' },
  ctaText: { type: String, default: '' },
  placement: { type: String, default: 'home' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  startsAt: { type: Date, default: null },
  endsAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
