import mongoose from 'mongoose';

interface IPetDocument extends mongoose.Document {
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
      type: String,
    },
    photos: [String],
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// petSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'owner',
//     select: '-__v -passwordChangedAt',
//   });
// });

export const Pet = mongoose.model<IPetDocument>('Pet', petSchema);
