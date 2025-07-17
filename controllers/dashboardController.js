const aiService = require('../services/aiService');
const firebaseService = require('../services/firebaseService');

const generateDashboard = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        // Fetch a larger number of transactions for more accurate statistics
        const allTransactions = await firebaseService.getTransactionsForUser(userId, 100);

        // Handle the case where a user has no transactions yet
        if (allTransactions.length === 0) {
            return res.status(200).json({
                totalSpent: 0,
                avgDailySpend: 0,
                topCategory: 'N/A',
                spendingByCategory: [],
                transactions: [],
                financialHealth: {
                    score: 50,
                    summary: "No activity yet. Add your first transaction to get started!",
                    recommendations: ["Start by logging your income and expenses to see your report."]
                }
            });
        }
        
        // --- 1. Calculate stats locally from transaction data ---
        const spendingByCategory = {};
        let totalSpent = 0;
        
        allTransactions.forEach(tx => {
            // Firestore returns timestamps that need conversion
            const transactionDate = tx.date ? tx.date.toDate() : new Date();
            // We only consider expenses from the last 30 days for this report
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            if (transactionDate > thirtyDaysAgo && tx.type === 'out') {
                totalSpent += tx.amount;
                spendingByCategory[tx.category] = (spendingByCategory[tx.category] || 0) + tx.amount;
            }
        });

        const avgDailySpend = totalSpent / 30;
        
        const topCategory = Object.keys(spendingByCategory).length > 0 
            ? Object.entries(spendingByCategory).reduce((a, b) => a[1] > b[1] ? a : b)[0]
            : 'N/A';

        const spendingByCategoryArray = Object.entries(spendingByCategory)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);

        // --- 2. Get AI Insights based on calculated stats ---
        const totalIncome = allTransactions
            .filter(t => t.type === 'in')
            .reduce((sum, t) => sum + t.amount, 0);

        const financialContext = {
            totalSpent,
            topCategory,
            income: totalIncome,
            numberOfExpenses: allTransactions.filter(t => t.type === 'out').length,
        };

        const financialHealth = await aiService.generateFinancialHealthInsight(financialContext);
        
        // --- 3. Format the 5 most recent transactions for display ---
        const recentTransactions = allTransactions.slice(0, 5).map(tx => ({
            date: tx.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            description: tx.description,
            category: tx.category,
            amount: tx.amount,
            type: tx.type
        }));

        // --- 4. Assemble the final report for the frontend ---
        const report = {
            totalSpent,
            avgDailySpend,
            topCategory,
            spendingByCategory: spendingByCategoryArray.slice(0, 5), // Show top 5 categories
            transactions: recentTransactions,
            financialHealth,
        };

        res.status(200).json(report);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateDashboard,
};
