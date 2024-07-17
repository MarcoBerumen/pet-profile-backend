import { NextFunction, Request, Response } from 'express';
import { controller } from '../../decorators/controller.decorator';
import { Delete, Get, Patch, Post } from '../../decorators/routes.decorator';
import { User } from '../../models/user/User.model';
import { AppError } from '../../error/AppError';
import jwt, { JwtPayload } from 'jsonwebtoken';

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

@controller('/auth')
export class AuthController {
  public static protect = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let token;
    // 1) GETTING TOKEN AND CHECK IF ITS THERE
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Porfavor incia sesión para tener acceso', 401));
    }

    //2) VERIFICATION TOKEN
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await User.findById(decoded.id);

    if (!user) return next(new AppError('El usuario ya no existe', 401));

    //4) CHECK IF USER CHANGED PASSWORD AFTER THE JWT WAS ISSUED
    if (user.changedPasswordAfter(decoded.iat!)) {
      return next(
        new AppError(
          'El usuario recientemente cambio de contraseña! Porfavor inicia sesión nuevamente',
          401
        )
      );
    }

    //GRANT ACCESS TO PROTECTED ROUTE
    req.user = user;
    next();
  };

  @Post('/signup')
  async signup(req: Request, res: Response, next: NextFunction) {
    if(req.body.phone){
      const possibleUser = await User.findOne({phone: req.body.phone});
      if(possibleUser) return next(new AppError("This phone is already taken", 400))
    }
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
    if (user.authCHallengeExpires!.getTime() < Date.now()) {
      user.generateCodeAuthChallengeAndSendEmail();
      await user.save();
      return next(new AppError('Time Expire code resent', 400));
    }
    if (user.authChallengeCode !== req.body.code)
      return next(new AppError('Codigo no valido', 400));
    user.emailConfirmed = true;
    user.authChallengeCode = undefined;
    user.authCHallengeExpires = undefined;
    user!.save();

    res.status(204).json({});
  }

  @Post('/login')
  async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;
    const user = await User.findOne({
      email,
    }).select('+password');
    if (!user) return next(new AppError('NO USER FOUND', 404));
    if (!(await user.correctPassword(password, user.password)))
      return next(new AppError('Incorrect email or password', 401));

    const token = signToken(user._id);
    const cookieOptions = {
      expires: new Date(
        Date.now() +
          (Number(process.env.JWT_COOKIE_EXPIRES_IN) ?? 0) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: false,
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);

    //REMOVE PASSWORD FROM THE OUTPUT
    user.password = '';

    res.status(200).json({
      ok: true,
      token,
      data: {
        user,
      },
    });
  }

  @Post('/forgot-password')
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppError('NO USER FOUND', 404));

    user.generateCodeAuthChallengeAndSendEmail();

    res.status(200).json({
      ok: true,
      message: 'Email Sent',
    });
  }

  @Patch('/reset-password')
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    const { code, password, passwordConfirm } = req.body;
    const user = await User.findOne({
      authChallengeCode: code,
      authCHallengeExpires: { $gt: Date.now() },
    });

    if (!user) return next(new AppError('THE TOKEN HAS EXPIRED', 400));

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.authCHallengeExpires = undefined;
    user.authChallengeCode = undefined;

    await user.save();

    res.status(204).json();
  }
}
