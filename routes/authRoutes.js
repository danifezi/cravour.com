
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const schemas = require('../src/config/schemas');

router.post(
    '/register', 
    authenticateToken, // First, verify the token created on the client by Firebase
    validate(schemas.registerSchema), // Then, validate the profile data
    authController.registerUser
);

module.exports = router;
