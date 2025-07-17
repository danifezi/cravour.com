
const paymentService = require('../services/paymentService');

const verifyPayment = async (req, res, next) => {
    try {
        const { reference } = req.body;
        const userId = req.user.uid;
        const result = await paymentService.verifyPayment(reference, userId);

        if (result.status === 'success') {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    verifyPayment,
};
