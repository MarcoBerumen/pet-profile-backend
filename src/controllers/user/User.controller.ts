import { controller } from '../../decorators/controller.decorator';
import { NextFunction, Request, Response } from 'express';
import { Delete, Post } from '../../decorators/routes.decorator';
import { Factory } from '../../models/Factory';
import { User } from '../../models/user/User.model';

const deleteUser = Factory(User).deleteOne;

@controller('/user')
export class UserController {
  @Delete('/:id')
  public deleteUser(req: Request, res: Response, next: NextFunction) {
    return deleteUser()(req, res, next);
  }
}
