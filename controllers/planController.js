
const aiService = require('../services/aiService');
const firebaseService = require('../services/firebaseService');

const generatePlanDemo = async (req, res, next) => {
    try {
        const { description } = req.body;
        const plan = await aiService.generateShoppingPlan(description);
        res.status(200).json(plan);
    } catch (error) {
        next(error);
    }
};

const createPlan = async (req, res, next) => {
    try {
        const { description } = req.body;
        const userId = req.user.uid;
        const planData = await aiService.generateShoppingPlan(description);
        const newPlan = await firebaseService.savePlan(userId, description, planData);
        res.status(201).json(newPlan);
    } catch (error) {
        next(error);
    }
};

const getPlans = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const plans = await firebaseService.getPlansForUser(userId);
        res.status(200).json(plans);
    } catch (error) {
        next(error);
    }
};

const updatePlanStatus = async (req, res, next) => {
    try {
        const { planId } = req.params;
        const { status } = req.body;
        const userId = req.user.uid;
        const updatedPlan = await firebaseService.updatePlanStatus(userId, planId, status);
        res.status(200).json(updatedPlan);
    } catch (error) {
        next(error);
    }
};

const deletePlan = async (req, res, next) => {
    try {
        const { planId } = req.params;
        const userId = req.user.uid;
        await firebaseService.deletePlan(userId, planId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generatePlanDemo,
    createPlan,
    getPlans,
    updatePlanStatus,
    deletePlan,
};
