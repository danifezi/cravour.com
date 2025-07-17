
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticateToken = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const schemas = require('../src/config/schemas');

router.use(authenticateToken);

router.post('/', validate(schemas.addTransactionSchema), transactionController.addTransaction);
router.post('/categorize', validate(schemas.descriptionSchema), transactionController.categorizeTransaction);

module.exports = router;
