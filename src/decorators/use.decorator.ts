import 'reflect-metadata';
import { RequestHandler } from 'express';
import { MetadataKeys } from './enums/MetadataKeys';
import { tryCatch } from '../utils/tryCatch';

export function use(middleware: RequestHandler) {
  return function (target: any, key: string, desc: PropertyDescriptor) {
    const middlewares =
      Reflect.getMetadata(MetadataKeys.MIDDLEWARE, target, key) || [];

    Reflect.defineMetadata(
      MetadataKeys.MIDDLEWARE,
      [...middlewares, tryCatch(middleware)],
      target,
      key
    );
  };
}
