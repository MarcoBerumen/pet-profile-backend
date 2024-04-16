import { NextFunction, Request, Response } from 'express';
import { AppError } from './AppError';

export function globalErrorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  err.statusCode = err.statusCode ?? 500;
  err.status = err.status ?? 'error';

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
}
