import mongoose from 'mongoose';
import { EModels } from '../enumModels';
import { Pet } from '../pet/Pet.model';

export enum EEncodedTypes{
  BUFFER = "BUFFER",
  HTTPURL = "HTTP_URL"
}

export interface IImageDocument extends mongoose.Document {
  src: any;
  contentType: string;
  encoded: string;
  pet: string;
}

const imageSchema = new mongoose.Schema({
  src: String,
  contentType: String,
  encoded: {
    type: String,
    enum: [EEncodedTypes.BUFFER, EEncodedTypes.HTTPURL],
    required:true
  }
});

imageSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    if (ret.src) {
      if (ret.src.type === 'Buffer')
        ret.src = ret.src.data;
        ret.type = ret.src.type;
        // base64 encoded buffer
        // ret.src = Buffer.from(ret.src.data).toString('base64');
    }
    return ret;
  },
});

imageSchema.post(
  /deleteOne/,
  { document: true, query: false },
  async function (doc) {
    await Pet.updateOne({ photos: doc._id }, { $pull: { photos: doc._id } });
  }
);

export const Image = mongoose.model<IImageDocument>(EModels.IMAGE, imageSchema);
