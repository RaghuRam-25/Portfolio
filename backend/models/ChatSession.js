const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
    },
    { timestamps: true }
);

const chatSessionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        messages: [chatMessageSchema],
        lastMessageAt: { type: Date, default: Date.now },
        isArchived: { type: Boolean, default: false },
        userHasUnread: { type: Boolean, default: false },
        adminHasUnread: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ChatSession', chatSessionSchema);