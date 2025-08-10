
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import * as schemas from '../config/validationSchemas';

// Controllers
import { userController } from '../controllers/userController';
import { transactionController } from '../controllers/transactionController';
import { financialController } from '../controllers/financialController';
import { adCreativeController } from '../controllers/adCreativeController';
import { paymentController } from '../controllers/paymentController';
import { waitlistController } from '../controllers/waitlistController';

const router = Router();

// --- Public Routes ---
router.post('/waitlist/join', validate(schemas.waitlistSchema), waitlistController.joinWaitlist);
router.post('/plans/generate', validate(schemas.descriptionSchema), financialController.generatePublicPlan);

// --- Authenticated Routes ---
router.use(authMiddleware);

// User
router.get('/user/profile', userController.getUserProfile);

// Dashboard
router.post('/dashboard', financialController.generateDashboard);

// Transactions
router.post('/transactions', validate(schemas.addTransactionSchema), transactionController.addTransaction);
router.post('/transactions/categorize', validate(schemas.descriptionSchema), transactionController.categorizeTransaction);

// Plans
router.post('/plans', financialController.createPlan);
router.get('/plans', financialController.getPlans);
router.patch('/plans/:planId', validate(schemas.updatePlanSchema), financialController.updatePlan);
router.delete('/plans/:planId', financialController.deletePlan);

// Ads
router.post('/ads/generate', validate(schemas.descriptionSchema), adCreativeController.generateAdCreative);

// Payments
router.post('/payments/verify', validate(schemas.verifyPaymentSchema), paymentController.verifyPayment);

export default router;