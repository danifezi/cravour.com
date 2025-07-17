
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authenticateToken = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const schemas = require('../src/config/schemas');

router.post('/verify', authenticateToken, validate(schemas.verifyPaymentSchema), paymentController.verifyPayment);

module.exports = router;
