import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { Mail } from '../../utils/Mail';
import validator from 'validator';
import { EModels } from '../enumModels';

export interface IUserDocument extends mongoose.Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  passwordChangedAt: Date;
  emailConfirmed: boolean;
  active: boolean;
  authChallengeCode?: string | undefined;
  authCHallengeExpires?: Date | undefined;

  generateCodeAuthChallengeAndSendEmail(): void;
  correctPassword(candidatePassword: string, password: string): boolean;
  changedPasswordAfter(JWTTimestamp: number): boolean;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    unique: true,
    validate: [validator.isMobilePhone, 'Please provide a valid phone number'],
  },
  photo: String,
  // role: {
  //   type: String,
  //   enum: ['user', 'guide', 'lead-guide', 'admin'],
  //   default: 'user',
  // },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [false, 'Please confirm your password'],
    validate: {
      //This only works on CREATE AND save
      validator: function (el: string) {
        return el === (this as any).password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  emailConfirmed: {
    type: Boolean,
    default: false,
    select: false,
  },
  authChallengeCode: String,
  authCHallengeExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  //ENCRYPT PASSWORD
  this.password = await bcrypt.hash(this.password, 12);

  //PASSWORD UNDEFINED
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

userSchema.methods.generateCodeAuthChallengeAndSendEmail = function () {
  const code = Math.round(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  this.authChallengeCode = code;
  this.authCHallengeExpires = new Date(Date.now() + 10 * 60 * 1000);
  Mail.sendConfirmEmailCode(this.email, this.authChallengeCode);
  this.save();
};

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  password: string
) {
  return await bcrypt.compare(candidatePassword, password);
};

userSchema.methods.changedPasswordAfter = function (
  JWTTimestamp: number
): boolean {
  if (this.passwordChangedAt) {
    const changedTimeStamp = +new Date(this.passwordChangedAt) / 1000;
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

export const User = mongoose.model<IUserDocument>(EModels.USER, userSchema);
