import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AppError } from '../error/AppError';

export const tryCatch = (fn: Function): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      fn(req, res, next);
    } catch (err: unknown | AppError) {
      next(err);
    }
  };
};
