import mongoose from 'mongoose';
import { EModels } from '../enumModels';

export interface IPetDocument extends mongoose.Document {
  name: string;
  description: string;
  address: string;
  photos: string[];
  reward: number;
}

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us the pet's name"],
    },
    description: {
      type: String,
      required: [true, 'Please tell us a brief description of your pet'],
    },
    address: {
      type: {
        type: String,
        default: 'Point',
        enum: 'Point',
      },
      coordinates: [Number],
      street: String,
      streetAddress: Number,
      apartmentNumber: Number,
      neighborhood: String,
      zipCode: String,
      description: String,
    },

    photos: [
      {
        type: mongoose.Schema.ObjectId,
        ref: EModels.IMAGE,
        required: false,
      },
    ],
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: EModels.USER,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

petSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

petSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'owner',
  //   select: '-__v -passwordChangedAt',
  // });
  this.populate({
    path: 'photos',
    select: ' src contentType encoded ',
  });
  next();
});

export const Pet = mongoose.model<IPetDocument>(EModels.PET, petSchema);
