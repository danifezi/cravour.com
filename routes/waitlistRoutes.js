const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlistController');
const validate = require('../middleware/validationMiddleware');
const schemas = require('../src/config/schemas');

router.post('/join', validate(schemas.waitlistSchema), waitlistController.joinWaitlist);

module.exports = router;
