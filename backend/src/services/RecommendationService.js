const Location = require('../models/Location');
const Review = require('../models/Review');
const User = require('../models/User');

class RecommendationService {
    /**
     * Recommends locations for a specific user based on their group tags and past reviews.
     */
    async recommendForUser(userId) {
        const user = await User.findById(userId).populate('mutualFriends');
        if (!user) throw new Error('User not found');

        const { groupTags, mutualFriends } = user;

        // 1. Find locations liked by mutual friends
        const friendReviews = await Review.find({
            userId: { $in: (mutualFriends || []).map(f => f._id) },
            rating: { $gte: 4 }
        });

        const friendRecommendedPlaceIds = [...new Set(friendReviews.map(r => r.placeId))];

        // 2. Find locations tagged with the same group tags
        const groupRecommendations = await Location.find({
            'userTags.tag': { $in: groupTags }
        })
            .sort({ averageRating: -1 })
            .limit(10);

        // 3. Merge and prioritize (friends' recommendations first)
        const friendPlaces = await Location.find({ placeId: { $in: friendRecommendedPlaceIds } });

        // De-duplicate and return
        const combined = [...friendPlaces, ...groupRecommendations];
        const unique = Array.from(new Map(combined.map(item => [item.placeId, item])).values());

        return unique.slice(0, 10);
    }

    /**
     * AI-based recommendation engine (Placeholder for Hourly AI processing)
     * This would typically run in a worker/cron job.
     */
    async processHourlyRecommendations() {
        console.log('Running AI Recommendation Engine processing...');
        // In a real app, this would use a transformer model or Gemini to:
        // 1. Cluster reviews by sentiment and group type.
        // 2. Identify trending places per group.
        // 3. Update 'lastRecommendedAt' for locations.

        // For now, we'll just log and return.
        return { status: 'processed', timestamp: new Date() };
    }
}

module.exports = new RecommendationService();
