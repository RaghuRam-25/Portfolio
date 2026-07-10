const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: [true, 'Client name is required'],
        trim: true,
    },
    company: {
        type: String,
        trim: true,
    },
    review: {
        type: String,
        required: [true, 'Review text is required'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    clientImage: {
        type: String, // URL of the uploaded image
    },
    order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);