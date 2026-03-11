const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  currentLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },
  groupTags: [{ type: String, enum: ['cousins', 'friends', 'family', 'couple', 'others'] }],
  visitedPlaces: [{
    placeId: String,
    visitDate: { type: Date, default: Date.now }
  }],
  mutualFriends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
