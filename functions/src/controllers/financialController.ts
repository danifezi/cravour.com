
import { Request, Response, NextFunction } from 'express';
import { firebaseService, Transaction } from '../services/firebaseService';
import { geminiService } from '../services/geminiService';

export const financialController = {
    generateDashboard: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.uid;
            
            const [userProfileSnap, allTransactions] = await Promise.all([
                firebaseService.getUserProfile(userId),
                firebaseService.getTransactionsForUser(userId, 100)
            ]);
    
            const userProfile = userProfileSnap.data() || { name: 'User', walletBalance: 0 };
    
            if (allTransactions.length === 0) {
                return res.status(200).json({
                    totalSpent: 0, avgDailySpend: 0, topCategory: 'N/A',
                    financialHealth: { score: 0, summary: "No data available.", recommendations: ["Start by adding some expenses to see your report."] },
                    spendingByCategory: [], transactions: [],
                    name: userProfile.name, walletBalance: userProfile.walletBalance,
                });
            }
            
            const spendingByCategory: { [key: string]: number } = {};
            let totalSpent = 0;
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
            allTransactions.forEach(tx => {
                if (tx.date.toDate() > thirtyDaysAgo && tx.type === 'out') {
                    totalSpent += tx.amount;
                    spendingByCategory[tx.category] = (spendingByCategory[tx.category] || 0) + tx.amount;
                }
            });
    
            const avgDailySpend = totalSpent / 30;
            const topCategory = Object.keys(spendingByCategory).length > 0 ? Object.entries(spendingByCategory).reduce((a, b) => a[1] > b[1] ? a : b)[0] : 'N/A';
            const financialContext = { totalSpent, numberOfTransactions: allTransactions.filter(tx => tx.type === 'out').length, topSpendingCategory: topCategory };
            const financialHealth = await geminiService.generateFinancialHealthInsight(financialContext);
    
            const spendingByCategoryArray = Object.entries(spendingByCategory).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
            
            const recentTransactions = allTransactions.slice(0, 5).map(tx => ({
                date: tx.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                description: tx.description, category: tx.category, amount: tx.amount, type: tx.type
            }));
    
            const report = {
                totalSpent, avgDailySpend, topCategory, financialHealth,
                spendingByCategory: spendingByCategoryArray.slice(0, 5),
                transactions: recentTransactions,
                name: userProfile.name, walletBalance: userProfile.walletBalance,
            };
    
            res.status(200).json(report);
        } catch (error) { next(error); }
    },

    createPlan: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const savedPlan = await firebaseService.savePlan(req.user.uid, req.body);
            res.status(201).json(savedPlan);
        } catch (error) { next(error); }
    },
    
    getPlans: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const plans = await firebaseService.getPlans(req.user.uid);
            res.status(200).json(plans);
        } catch (error) { next(error); }
    },
    
    updatePlan: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { planId } = req.params;
            const { status } = req.body;
            await firebaseService.updatePlan(req.user.uid, planId, { status });
            res.status(200).json({ message: 'Plan updated successfully.' });
        } catch (error) { next(error); }
    },
    
    deletePlan: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { planId } = req.params;
            await firebaseService.deletePlan(req.user.uid, planId);
            res.status(200).json({ message: 'Plan deleted successfully.' });
        } catch (error) { next(error); }
    },

    generatePublicPlan: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { description } = req.body;
            const planDetails = await geminiService.generateShoppingPlan(description);
            res.status(200).json(planDetails);
        } catch (error) {
            next(error);
        }
    }
};
