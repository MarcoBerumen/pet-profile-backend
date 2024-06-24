import * as express from 'express';
import mongoose, { FilterQuery } from 'mongoose';
import { User } from '../models/user/User.model';

declare global {
  namespace Express {
    interface Request {
      user: User;
      query: undefined | FilterQuery;
    }
  }
}
