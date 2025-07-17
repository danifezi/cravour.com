
const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const authenticateToken = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const schemas = require('../src/config/schemas');

// Public demo route, no auth needed
router.post('/demo', validate(schemas.descriptionSchema), planController.generatePlanDemo);

// Authenticated routes
router.use(authenticateToken);

router.post('/', validate(schemas.descriptionSchema), planController.createPlan);
router.get('/', planController.getPlans);
router.patch('/:planId', validate(schemas.updatePlanStatusSchema), planController.updatePlanStatus);
router.delete('/:planId', planController.deletePlan);

module.exports = router;
