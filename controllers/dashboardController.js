
const aiService = require('../services/aiService');
const firebaseService = require('../services/firebaseService');

const generateDashboard = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const transactions = await firebaseService.getTransactionsForUser(userId, 20);

        let transactionsString = "No transactions found for this user yet.";
        if (transactions.length > 0) {
            transactionsString = transactions.map(t => {
                const type = t.type === 'in' ? 'Incoming' : 'Outgoing';
                return `- ${type}: ₦${t.amount} for '${t.description}' (${t.category}) on ${new Date(t.date.toDate()).toDateString()}`;
            }).join('\n');
        }

        const report = await aiService.generateDashboardReport(transactionsString);
        res.status(200).json(report);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateDashboard,
};
