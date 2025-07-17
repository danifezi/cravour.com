
const aiService = require('../services/aiService');

const generateAdCopy = async (req, res, next) => {
    try {
        const { description } = req.body;
        const adCopy = await aiService.generateAdCopy(description);
        res.status(200).json(adCopy);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateAdCopy,
};
