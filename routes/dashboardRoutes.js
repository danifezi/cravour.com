
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, dashboardController.generateDashboard);

module.exports = router;
