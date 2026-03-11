const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    placeId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: String,
    groupType: { type: String, enum: ['cousins', 'friends', 'family', 'couple', 'others'] },
    photos: [String],
    visitDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
