
import { Request, Response, NextFunction } from 'express';
import { firebaseService } from '../services/firebaseService';
import { ApiError } from '../middleware/errorMiddleware';

export const userController = {
    getUserProfile: async (req: Request, res: Response, next: NextFunction) => {
        try {
          const userId = req.user.uid;
          const profile = await firebaseService.getUserProfile(userId);
          if (!profile.exists) {
            throw new ApiError('User profile not found.', 404);
          }
          res.status(200).json(profile.data());
        } catch (error) {
          next(error);
        }
    }
};
