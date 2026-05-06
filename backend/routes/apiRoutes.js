const express = require('express');
const authController = require('../controllers/authController');
const analyticsController = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Public Routes
router.post('/login', authController.login);

// Protected Routes
router.get('/events', verifyToken, analyticsController.getEvents);
router.get('/analytics/ga', verifyToken, analyticsController.getGaAnalytics);
router.get('/dashboard', verifyToken, analyticsController.getDashboard);

module.exports = router;
