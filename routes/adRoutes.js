
const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const authenticateToken = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const schemas = require('../src/config/schemas');

router.post('/generate', authenticateToken, validate(schemas.descriptionSchema), adController.generateAdCreative);

module.exports = router;
