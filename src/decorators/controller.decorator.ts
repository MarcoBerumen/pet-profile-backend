import { AppRouter } from '../router/AppRouter';
import { tryCatch } from '../utils/tryCatch';
import 'reflect-metadata';
import { MetadataKeys } from './enums/MetadataKeys';
import { RoutePrefix } from '../router/RoutePrefix';
import { HttpMethods } from './enums/HttpMethods';

export function controller(routePrefix: string): Function {
  return function (target: Function): void {
    const router = AppRouter.instance;

    for (let key of Object.getOwnPropertyNames(target.prototype)) {
      const routeHandler = tryCatch(target.prototype[key]);

      const path = Reflect.getMetadata(
        MetadataKeys.PATH,
        target.prototype,
        key
      );

      const method: HttpMethods = Reflect.getMetadata(
        MetadataKeys.METHOD,
        target.prototype,
        key
      );

      const middlewares =
        Reflect.getMetadata(MetadataKeys.MIDDLEWARE, target.prototype, key) ??
        [];

      if (path) {
        router[method](
          `${RoutePrefix.V1}${routePrefix}${path}`,
          ...middlewares,
          routeHandler
        );
      }
    }
  };
}
