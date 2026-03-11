const Location = require('../models/Location');
const Review = require('../models/Review');

exports.searchLocations = async (req, res) => {
    try {
        const { city, state, country, tag } = req.query;
        let query = {};

        if (city) query.city = city;
        if (state) query.state = state;
        if (country) query.country = country;
        if (tag) query['userTags.tag'] = tag;

        const locations = await Location.find(query).sort({ averageRating: -1 });
        res.json(locations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addReview = async (req, res) => {
    try {
        const { placeId, rating, review, groupType, name, address, coordinates } = req.body;
        const userId = req.user.id; // From auth middleware

        // 1. Create or update Location entry
        let location = await Location.findOne({ placeId });
        if (!location) {
            location = new Location({
                placeId,
                name,
                address,
                coordinates,
                userTags: [{ tag: groupType, count: 1 }]
            });
        } else {
            // Update tag count
            const tagIndex = location.userTags.findIndex(t => t.tag === groupType);
            if (tagIndex > -1) {
                location.userTags[tagIndex].count += 1;
            } else {
                location.userTags.push({ tag: groupType, count: 1 });
            }
        }

        // 2. Create Review
        const newReview = new Review({
            userId,
            placeId,
            rating,
            review,
            groupType
        });
        await newReview.save();

        // 3. Update Location average rating
        const allReviews = await Review.find({ placeId });
        const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

        location.averageRating = avgRating;
        location.totalReviews = allReviews.length;
        await location.save();

        res.status(201).json({ message: 'Review added successfully', location });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
