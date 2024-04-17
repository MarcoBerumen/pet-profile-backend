import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { Mail } from '../../utils/Mail';
import validator from 'validator';

interface IUserDocument extends mongoose.Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  passwordChangedAt: Date;
  passwordResetToken: string;
  passwordResetExpires: Date;
  emailConfirmed: boolean;
  emailConfirmCode: string;
  codeExpires: Date;
  active: boolean;

  generateCodeAuthChallengeAndSendEmail(): void;
  correctPassword(): boolean;
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
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailConfirmed: {
    type: Boolean,
    default: false,
    select: false,
  },
  emailConfirmCode: String,
  codeExpires: Date,
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
  const emailConfirmCode = Math.round(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  this.emailConfirmCode = emailConfirmCode;
  this.emailConfirmed = false;
  this.codeExpires = new Date(Date.now() + 10 * 60 * 1000);
  Mail.sendConfirmEmailCode(this.email, this.emailConfirmCode);
  this.save();
};

// Set emailConfirmPassword to false, generate code and send email
// userSchema.pre('save', function (next) {
//   if (!this.isNew || !this.isModified('emailConfirmCode')) return next();
//   const emailConfirmCode = Math.round(Math.random() * 1000000)
//     .toString()
//     .padStart(6, '0');
//   this.emailConfirmCode = emailConfirmCode;
//   this.emailConfirmed = false;
//   this.codeExpires = new Date(Date.now() + 10 * 60 * 1000);
//   Mail.sendConfirmEmailCode(this.email, this.emailConfirmCode);
//   return next();
// });

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export const User = mongoose.model<IUserDocument>('User', userSchema);
