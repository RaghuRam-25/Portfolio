const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
  },
  category: {
    type: String,
    required: [true, 'Project category is required'],
  },
  thumbnail: { type: String }, // URL of the uploaded thumbnail image
  images: [{ type: String }], // URLs of gallery images
  techStack: [{ type: String }], // Array of technologies used
  githubUrl: { type: String },
  liveUrl: { type: String },
  isPublished: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isDelivered: { type: Boolean, default: false }, // Delivered/Completed project কিনা
  order: { type: Number, default: 0 }, // For custom ordering in the frontend
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
