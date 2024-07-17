import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

process.on('uncaughtException', (err: Error): void => {
  console.log('🟥🟥🟥UNCAUGH EXCEPTION!🟥🟥🟥');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PORT = process.env.PORT ?? 4000;

import app from './app';
import { AppError } from './error/AppError';

//DATABASE
mongoose.connect(process.env.DATABASE_DEV!, {}).then(() => {
  console.log('DB CONNECTION SUCCESSFULL');
});

const server = app.listen(PORT, (): void => {
  console.log(`App running on port ${PORT}...`);
});

process.on('unhandledRejection', function (err: Error | AppError): void {
  console.log(err.name, err.message);
  console.log('🟥🟥🟥Unhandled the rejection! shutting down🟥🟥🟥');
  server.close((err): void => {
    console.log(err);
    process.exit(1);
  });
});
