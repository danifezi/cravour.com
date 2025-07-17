
const aiService = require('../services/aiService');
const firebaseService = require('../services/firebaseService');

const addTransaction = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const result = await firebaseService.addTransaction(userId, req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

const categorizeTransaction = async (req, res, next) => {
    try {
        const { description } = req.body;
        const result = await aiService.categorizeTransaction(description);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addTransaction,
    categorizeTransaction,
};
