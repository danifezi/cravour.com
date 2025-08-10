
import { Request, Response, NextFunction } from 'express';

// Custom Error class for expected API errors
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("API Error:", err.message, err.stack);

  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  res.status(500).json({
    error: 'An internal server error occurred. Please try again later.'
  });
};
