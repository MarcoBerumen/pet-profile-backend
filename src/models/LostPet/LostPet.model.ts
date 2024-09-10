import mongoose from "mongoose";
import { EModels } from "../enumModels";
import { path } from "../../app";

export interface ILostPetDocument extends mongoose.Document {
    pet:string;
    reward: number;
    active: boolean;
    found: Date;
    address?: {
        line: string;
        coordinates: number[];
    }
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
        address: {
            type: {
                type: String,
                default: "Point",
                enum: ["Point"]
            },
            coordinates: {
                type: [Number],
                required: true,
                index: "2dsphere"
            },
            line: String
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

lostPetSchema.index({'address.coordinates': "2dsphere"});

export const LostPet = mongoose.model<ILostPetDocument>(EModels.LOST_PET, lostPetSchema);