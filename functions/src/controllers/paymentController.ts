
import { Request, Response, NextFunction } from 'express';
import { paystackService } from '../services/paystackService';
import { firebaseService } from '../services/firebaseService';

export const paymentController = {
    verifyPayment: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { reference } = req.body;
            const userId = req.user.uid;
    
            const transactionDetails = await paystackService.verifyTransaction(reference);
            const amountInNaira = transactionDetails.amount / 100;
    
            const existing = await firebaseService.findTransactionByReference(userId, reference);
            if (existing.length > 0) {
                return res.status(409).json({ error: "This transaction has already been processed." });
            }
            
            const transactionData = {
                description: `Wallet funding via Paystack`,
                amount: amountInNaira,
                date: new Date().toISOString().split('T')[0],
                type: 'in',
                category: 'Funding',
                reference: reference,
            };
            await firebaseService.addTransaction(userId, transactionData);
    
            res.status(200).json({ message: "Payment verified and wallet funded successfully." });
    
        } catch (error) {
            next(error);
        }
    }
};
