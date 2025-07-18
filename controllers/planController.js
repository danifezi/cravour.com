const aiService = require('../services/aiService');

const generatePlan = async (req, res, next) => {
    try {
        const { description } = req.body;
        if (!description || description.trim().length < 10) {
            return res.status(400).json({ error: "A detailed description is required." });
        }
        const plan = await aiService.generateShoppingPlan(description);
        res.status(200).json(plan);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generatePlan,
};
