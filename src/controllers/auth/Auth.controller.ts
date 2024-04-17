import { NextFunction, Request, Response } from 'express';
import { controller } from '../../decorators/controller.decorator';
import { Delete, Get, Post } from '../../decorators/routes.decorator';
import { User } from '../../models/user/User.model';
import { AppError } from '../../error/AppError';

@controller('/auth')
export class AuthController {
  @Post('/signup')
  async signup(req: Request, res: Response, next: NextFunction) {
    const newUser = await User.create({ ...req.body });
    newUser.generateCodeAuthChallengeAndSendEmail();
    res.status(201).json({
      ok: true,
      data: newUser,
    });
  }

  @Post('/confirm-email')
  async confirmEmail(req: Request, res: Response, next: NextFunction) {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) return next(new AppError('No user Found', 404));
    if (user.codeExpires!.getTime() < Date.now()) {
      user.generateCodeAuthChallengeAndSendEmail();
      await user.save();
      return next(new AppError('Time Expire code resent', 400));
    }
    if (user.emailConfirmCode !== req.body.code)
      return next(new AppError('Codigo no valido', 400));
    user!.emailConfirmed = true;
    user!.save();

    res.status(204).json({});
  }
}
