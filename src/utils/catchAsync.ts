import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AppError } from '../error/AppError';

export const catchAsync = (fn: Function): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: Error | AppError) => next(err));
  };
};
