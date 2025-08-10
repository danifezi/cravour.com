
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from './errorMiddleware';

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const readableErrors = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      next(new ApiError(`Invalid request data: ${readableErrors}`, 400));
    } else {
      next(new ApiError('An unexpected error occurred during validation', 500));
    }
  }
};
