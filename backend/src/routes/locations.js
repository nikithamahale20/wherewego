const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/search', locationController.searchLocations);
router.post('/review', locationController.addReview);

module.exports = router;
