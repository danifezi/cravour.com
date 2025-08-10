
import { Request, Response, NextFunction } from 'express';
import { geminiService } from '../services/geminiService';

export const adCreativeController = {
    generateAdCreative: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { description } = req.body;
            
            const [adCopy, imageUrl] = await Promise.all([
                geminiService.generateAdCopy(description),
                geminiService.generateAdImage(description)
            ]);
    
            const adCreative = { ...adCopy, imageUrl };
            res.status(200).json(adCreative);
        } catch (error) {
            next(error);
        }
    }
};
