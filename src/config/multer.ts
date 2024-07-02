import { Request, RequestHandler } from 'express';
import multer from 'multer';
import { AppError } from '../error/AppError';

export class Multer {
  private static instance: Multer | undefined;
  private storage = multer.memoryStorage(); //DEFAULT
  public upload: multer.Multer;

  public static getInstance = (): Multer => {
    if (!this.instance) this.instance = new Multer();
    return this.instance;
  };

  private constructor() {
    this.upload = multer(this.options);
  }

  private fileFilterFunction = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new AppError("Only image files are allowed!", 400));
    }
    return cb(null, true);
  };

  private get options(): multer.Options {
    const options: multer.Options = {
      fileFilter: this.fileFilterFunction,
      storage: this.storage,
      limits: {
        fileSize: 1024 * 1024 * 5,
        files: 3,
      },
    };
    return options;
  }
}
