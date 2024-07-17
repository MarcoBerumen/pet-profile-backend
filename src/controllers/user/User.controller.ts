import { controller } from '../../decorators/controller.decorator';
import { NextFunction, Request, Response } from 'express';
import { Delete, Get, Post } from '../../decorators/routes.decorator';
import { Factory } from '../../models/Factory';
import { User } from '../../models/user/User.model';
import { use } from '../../decorators/use.decorator';
import { AuthController } from '../auth/Auth.controller';

const deleteUser = Factory(User).deleteOne;

@controller('/user')
export class UserController {
  @Delete('/:id')
  public deleteUser(req: Request, res: Response, next: NextFunction) {
    return deleteUser()(req, res, next);
  }

  @Get("/")
  @use(AuthController.protect)
  public async getMe(req:Request, res:Response, next:NextFunction) {
    return res.status(200).json({
      status: true,
      data: req.user
    })
  }
}
