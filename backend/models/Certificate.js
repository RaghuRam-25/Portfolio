const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Certificate name is required'],
        trim: true,
    },
    organization: {
        type: String,
        required: [true, 'Issuing organization is required'],
    },
    issueDate: {
        type: Date,
        required: [true, 'Issue date is required'],
    },
    credentialLink: {
        type: String,
    },
    certificateImage: {
        type: String, // URL of the uploaded image
        required: [true, 'Certificate image is required'],
    },
    order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);