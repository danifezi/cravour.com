
import { Request, Response, NextFunction } from 'express';
import { firebaseService } from '../services/firebaseService';
import { ApiError } from '../middleware/errorMiddleware';

export const waitlistController = {
    joinWaitlist: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;
            await firebaseService.saveToWaitlist(email);
            res.status(201).json({ 
                message: "You're on the list! We'll be in touch.", 
            });
        } catch (error) {
            if (error instanceof ApiError && error.statusCode === 409) {
                 return res.status(200).json({ message: error.message });
            }
            next(error);
        }
    }
};
