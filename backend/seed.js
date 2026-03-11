const mongoose = require('mongoose');
const User = require('./src/models/User');
const Location = require('./src/models/Location');
const Review = require('./src/models/Review');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wherewego';

const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Location.deleteMany({});
        await Review.deleteMany({});

        // Create a demo user
        const user = await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'hashed_password', // In real app use bcrypt
            groupTags: ['friends', 'cousins'],
        });

        // Create some locations
        const locations = await Location.insertMany([
            {
                placeId: 'p1',
                name: 'Grand Canyon',
                city: 'Arizona',
                country: 'USA',
                averageRating: 4.9,
                totalReviews: 120,
                userTags: [{ tag: 'friends', count: 50 }, { tag: 'family', count: 30 }]
            },
            {
                placeId: 'p2',
                name: 'Eiffel Tower',
                city: 'Paris',
                country: 'France',
                averageRating: 4.8,
                totalReviews: 500,
                userTags: [{ tag: 'couple', count: 400 }, { tag: 'friends', count: 50 }]
            },
            {
                placeId: 'p3',
                name: 'Ibiza Beach',
                city: 'Ibiza',
                country: 'Spain',
                averageRating: 4.7,
                totalReviews: 200,
                userTags: [{ tag: 'friends', count: 180 }, { tag: 'cousins', count: 20 }]
            }
        ]);

        console.log('Seed data created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
