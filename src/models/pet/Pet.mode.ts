import mongoose from 'mongoose';

interface IPetDocument extends mongoose.Document {
  name: string;
  description: string;
  address: object;
  photos: string[];
}
