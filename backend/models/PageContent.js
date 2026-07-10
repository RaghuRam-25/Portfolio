const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema({
  key: {
    type: String,
    enum: ['homepage', 'about', 'contact', 'website-settings'],
    required: true,
    unique: true,
  },
  title: { type: String, default: '' },
  content: { type: mongoose.Schema.Types.Mixed, default: {} },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('PageContent', pageContentSchema);
