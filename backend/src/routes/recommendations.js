const express = require('express');
const router = express.Router();
const recommendationService = require('../services/RecommendationService');
// const auth = require('../middleware/auth'); // Placeholder for now

router.get('/user/:userId', async (req, res) => {
    try {
        const recommendations = await recommendationService.recommendForUser(req.params.userId);
        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/process-hourly', async (req, res) => {
    try {
        const result = await recommendationService.processHourlyRecommendations();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
