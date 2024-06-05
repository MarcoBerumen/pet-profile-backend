import { controller } from '../../decorators/controller.decorator';
import { NextFunction, Request, Response } from 'express';
import { Delete, Get, Patch, Post } from '../../decorators/routes.decorator';
import { Factory } from '../../models/Factory';
import { User } from '../../models/user/User.model';
import { use } from '../../decorators/use.decorator';
import { AuthController } from '../auth/Auth.controller';
import { Pet } from '../../models/pet/Pet.model';

const { create, deleteOne, findAll, updateOne } = Factory(Pet);

@controller('/pet')
export class PetController {
  @Post('/')
  @use(AuthController.protect)
  public create(req: Request, res: Response, next: NextFunction) {
    req.body = { ...req.body, owner: req.user.id };
    return create()(req, res, next);
  }
  @Delete('/:id')
  @use(AuthController.protect)
  public deletePet(req: Request, res: Response, next: NextFunction) {
    return deleteOne()(req, res, next);
  }
  @Get('/')
  @use(AuthController.protect)
  public async getAll(req: Request, res: Response, next: NextFunction) {
    req.query = { owner: req.user.id };
    return findAll()(req, res, next);
  }
  @Patch('/:id')
  @use(AuthController.protect)
  public async update(req: Request, res: Response, next: NextFunction) {
    return updateOne()(req, res, next);
  }
}
