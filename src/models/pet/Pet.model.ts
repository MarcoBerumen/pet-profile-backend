import mongoose from 'mongoose';
import { EModels } from '../enumModels';
import { LostPet } from '../LostPet/LostPet.model';

export interface IPetDocument extends mongoose.Document {
  name: string;
  description: string;
  address: string;
  photos: string[];
  reward: number;
  isLost: boolean;
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
    isLost: {
      type: Boolean,
      default: false
    }
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

petSchema.post(/^find/, async function (docs, next) {
  for (let i= 0; i< docs.length; i++) {
    const doc = docs[i]
    doc.isLost = false
    const lostAd = await LostPet.findOne({
      active:true,
      pet: doc._id
    }).select('active');

    if(lostAd) docs[i].isLost = true;
  }
  next();
});

export const Pet = mongoose.model<IPetDocument>(EModels.PET, petSchema);
