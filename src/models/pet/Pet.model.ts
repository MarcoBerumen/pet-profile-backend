import mongoose, { Query } from 'mongoose';
import { EModels } from '../enumModels';
import { LostPet } from '../LostPet/LostPet.model';
import { QrCode } from '../qrCode/QrCode.model';

export interface IPetDocument extends mongoose.Document {
  name: string;
  description: string;
  address: {
    type: string;
    coordinates: number[];
    line:string
  };
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
        enum: ['Point'],
      },
      coordinates: {type: [Number], required: true, index: "2dsphere"},
      line: String,
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
    },
    reward: {
      type: Number,
    },
    qr: {
      type: String,
    },
    lossDirection: {
      coordinates: [Number],
      line: String
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

petSchema.index({ 'address.coordinates': "2dsphere"})

petSchema.pre(/^find/, function (this: Query<any, Document>, next) {
  this.find({ active: { $ne: false } });
  next();
});

petSchema.pre(/^find/, function (this: Query<any, Document>, next) {
  this.populate({
    path: 'photos',
    select: ' src contentType encoded ',
  });
  next();
});

petSchema.post(/^find/, async function (docs, next) {
  if(!docs) return next()
  for (let i= 0; i< docs.length; i++) {
    const doc = docs[i]
    doc.isLost = false
    const lostAd = await LostPet.findOne({
      active:true,
      pet: doc._id
    }).select('active reward address') ;


    if(lostAd) {
      docs[i].isLost = true;
      docs[i].reward = lostAd.reward;
      // IF LOST AD HAS AN ADDRESS
      docs[i].lossDirection = lostAd.address ??  undefined;
    }
  }
  next();
});

petSchema.post(/^find/, async function (docs, next) {
  if (!docs) return next()
  for(let i= 0 ; i< docs.length; i++){
    const doc = docs[i]
    const petId = doc._id;
    const qr = await QrCode.findOne({
      pet: petId
    }).select("id")

    if (qr) docs[i].qr = qr.id;
    else docs[i].qr = undefined;

  }
  next()
})

export const Pet = mongoose.model<IPetDocument>(EModels.PET, petSchema);
