const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const validate = require('../middleware/validationMiddleware');
const schemas = require('../src/config/schemas');

// Public demo route, no auth needed
router.post('/generate', validate(schemas.descriptionSchema), planController.generatePlan);

module.exports = router;
