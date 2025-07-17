
const aiService = require('../services/aiService');

const generateAdCreative = async (req, res, next) => {
    try {
        const { description } = req.body;
        
        // Generate both text and image in parallel for efficiency
        const [adCopy, imageUrl] = await Promise.all([
            aiService.generateAdCopy(description),
            aiService.generateAdImage(description)
        ]);

        // Combine the results into a single ad creative object
        const adCreative = {
            ...adCopy,
            imageUrl
        };

        res.status(200).json(adCreative);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateAdCreative,
};
