import mongoose from "mongoose";
import { EModels } from "../enumModels";


export interface IQrCodeDocument extends mongoose.Document {
    id:string;
}

const qrSchema = new mongoose.Schema(
    {
        id: {
            type:String,
            required: true
        },
        pet: {
            type: mongoose.Schema.ObjectId,
            ref: EModels.PET
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: EModels.USER
        },
        image: {
            type: mongoose.Schema.ObjectId,
            ref: EModels.IMAGE,
            required: true
        }
    }, 
    {
        toJSON: {virtuals:true},
        toObject: {virtuals: true}
    }
)


export const QrCode = mongoose.model<IQrCodeDocument>(EModels.QR_CODE, qrSchema)