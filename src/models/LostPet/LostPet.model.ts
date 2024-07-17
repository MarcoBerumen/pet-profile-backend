import mongoose from "mongoose";
import { EModels } from "../enumModels";
import { path } from "../../app";

export interface ILostPetDocument extends mongoose.Document {
    pet:string;
    active: boolean;
    found: Date;
    createdAt: Date;
    updatedAt: Date;
}


const lostPetSchema = new mongoose.Schema(
    {
        pet: {
            type:mongoose.Schema.ObjectId,
            ref: EModels.PET,
            required: true
        },
        reward: {
            type: Number,
            required: true
        },
        active: {
            type: Boolean,
            default: true
        },
        found: {
            type: Date,
            required: false
        },
        date: {
            type: Date,
            required: true,
            default: Date.now
        }
    }, 
    {
        timestamps: true
    }
)

export const LostPet = mongoose.model<ILostPetDocument>(EModels.LOST_PET, lostPetSchema);