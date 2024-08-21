import { controller } from '../../decorators/controller.decorator';
import { NextFunction, Request, Response } from 'express';
import { Delete, Get, Patch, Post } from '../../decorators/routes.decorator';
import { Factory } from '../../models/Factory';
import { User } from '../../models/user/User.model';
import { use } from '../../decorators/use.decorator';
import { AuthController } from '../auth/Auth.controller';
import { AppError } from '../../error/AppError';

const deleteUser = Factory(User).deleteOne;

@controller('/user')
export class UserController {
  @Delete('/:id')
  @use(AuthController.protect)
  public async deleteUser(req: Request, res: Response, next: NextFunction) {
    const doc = await User.findByIdAndUpdate(req.user.id, {
      active: false
    });

    if (!doc)
      return next(new AppError('No document found with this id', 404));

    res.status(204).end();
  }

  @Get("/me")
  @use(AuthController.protect)
  public async getMe(req:Request, res:Response, next:NextFunction) {
    return res.status(200).json({
      status: true,
      data: req.user
    })
  }

  @Delete("/")
  @use(AuthController.protect)
  public async deleteMe(req:Request, res:Response, next: NextFunction) {
    await User.updateOne({id: req.user._id}, {active: false});
    return res.status(204).end()
  }

  @Patch("/me")
  @use(AuthController.protect)
  public async updateMe(req:Request, res:Response, next:NextFunction){
    const updatedUser = await User.updateOne({_id: req.user.id}, {
      name: req.body.name,
      instagram: req.body.instagram
    })
    return res.status(204).end()
  }
}
