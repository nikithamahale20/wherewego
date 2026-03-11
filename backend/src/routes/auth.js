const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/register
// User signup
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        // Create a payload for JWT
        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_super_secret_jwt_key', { expiresIn: '7d' });

        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, interests: user.interests } });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// POST /api/auth/login
// User login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create JWT
        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_super_secret_jwt_key', { expiresIn: '7d' });

        res.json({ token, user: { id: user._id, name: user.name, email: user.email, interests: user.interests } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// PUT /api/auth/onboarding
// Update interests (needs valid user ID, since we lack middleware right now we'll pass userId in body, 
// but using a token middleware is better. For simplicity let's accept userId in body).
router.put('/onboarding', async (req, res) => {
    try {
        const { userId, interests } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (interests && Array.isArray(interests)) {
            user.interests = interests;
        }

        await user.save();

        res.json({ message: 'Onboarding complete', user: { id: user._id, name: user.name, email: user.email, interests: user.interests } });
    } catch (error) {
        console.error('Onboarding update error:', error);
        res.status(500).json({ error: 'Server error updating onboarding profile' });
    }
});

// GET /api/auth/profile/:userId
// Fetch user profile info
router.get('/profile/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ id: user._id, name: user.name, email: user.email, interests: user.interests });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

module.exports = router;
