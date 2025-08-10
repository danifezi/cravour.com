
import { Request, Response, NextFunction } from 'express';
import { firebaseService } from '../services/firebaseService';
import { geminiService } from '../services/geminiService';

export const transactionController = {
    addTransaction: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await firebaseService.addTransaction(req.user.uid, req.body);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    },

    categorizeTransaction: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { description } = req.body;
            const categoryData = await geminiService.categorizeTransaction(description);
            res.status(200).json(categoryData);
        } catch (error) {
            next(error);
        }
    }
};
