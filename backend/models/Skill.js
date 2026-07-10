const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Skill name is required'],
        trim: true,
        unique: true, // প্রতিটি স্কিলের নাম ইউনিক হওয়া উচিত
    },
    description: {
        type: String,
        required: [true, 'Skill description is required'],
    },
    category: {
        type: String,
        required: [true, 'Skill category is required'],
        enum: ['frontend', 'backend', 'database', 'devops', 'other'],
        default: 'other',
    },
    level: { // Proficiency level (0-100)
        type: Number,
        required: [true, 'Proficiency level is required'],
        min: 0,
        max: 100,
    },
    years: { // Years of experience
        type: Number,
        required: [true, 'Years of experience is required'],
    },
    order: { type: Number, default: 0 }, // For custom ordering
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);