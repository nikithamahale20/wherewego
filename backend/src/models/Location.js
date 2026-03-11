const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    placeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
        lat: Number,
        lng: Number
    },
    categories: [String], // e.g., 'restaurant', 'park'
    userTags: [{
        tag: { type: String, enum: ['cousins', 'friends', 'family', 'couple', 'others'] },
        count: { type: Number, default: 0 }
    }],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isSponsored: { type: Boolean, default: false },
    adContent: {
        title: String,
        description: String,
        imageUrl: String,
        link: String
    },
    lastRecommendedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);
