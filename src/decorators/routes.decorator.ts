import 'reflect-metadata';
import { RequestHandler } from 'express';

import { HttpMethods } from './enums/HttpMethods';
import { MetadataKeys } from './enums/MetadataKeys';

interface RequqestHandlerDescriptor extends PropertyDescriptor {
  value?: RequestHandler;
}

function routeBinder(method: string) {
  return function <T>(path: string) {
    return function (target: T, key: string, desc: RequqestHandlerDescriptor) {
      Reflect.defineMetadata(MetadataKeys.PATH, path, target as object, key);
      Reflect.defineMetadata(
        MetadataKeys.METHOD,
        method,
        target as object,
        key
      );
    };
  };
}

export const Get = routeBinder(HttpMethods.GET);
export const Post = routeBinder(HttpMethods.POST);
export const Delete = routeBinder(HttpMethods.DELETE);
export const Patch = routeBinder(HttpMethods.PATCH);
export const Put = routeBinder(HttpMethods.PUT);
