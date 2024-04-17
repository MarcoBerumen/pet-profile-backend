import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import { AppError } from './error/AppError';
import { globalErrorHandler } from './error/globalErrorHandler';
import { AppRouter } from './router/AppRouter';

//IMPORT ALL CONTROLLERS
import './controllers';

enum ENVS {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

const app = express();

if (process.env.NODE_ENV === ENVS.DEVELOPMENT) app.use(morgan('dev'));

app.use(cors());

app.use(helmet());
app.use(
  '/api',
  rateLimit({
    max: 50,
    windowMs: 60 * 60 * 1000,
    message:
      'Too many request from this IP address, please try again in an hour',
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(hpp());

//ROUTER
app.use(AppRouter.instance);

//IF ROUTE NOT FOUND
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export = app;
