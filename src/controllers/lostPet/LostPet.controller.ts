import { NextFunction, Request, Response } from "express";
import { controller } from "../../decorators/controller.decorator";
import { Get, Post } from "../../decorators/routes.decorator";
import { Factory } from "../../models/Factory";
import { LostPet } from "../../models/LostPet/LostPet.model";
import { AuthController } from "../auth/Auth.controller";
import { use } from "../../decorators/use.decorator";
import mongoose, { Aggregate, PipelineStage } from "mongoose";
import { Pet } from "../../models/pet/Pet.model";




// const  {create: createLostPet, deleteOne: deleteLostPet, findAll: findAllLostPet, updateOne: updateLostPet} = Factory(LostPet)

@controller("/lost-pet")
export class LostPetController {

    @Get('/')
    @use(AuthController.protect)
    public async getAll(req: Request, res: Response, next: NextFunction) {
        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit.toString()) : 20;
        const radius = req.query.radius ? parseFloat(req.query.radius.toString()) : 30; // RADIUS IN KM
        const  {latitude, longitude} = req.query;

        const skip = (page - 1) * limit;

        // QUERY THE PETS INSIDE THE SPHERE
        const aggregationPets: PipelineStage[] = [];
        if(latitude && longitude && radius) {
            aggregationPets.push({
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [parseFloat(longitude.toString()), parseFloat(latitude.toString())]
                    },
                    distanceField: "distance",
                    maxDistance: radius * 1000,
                    spherical: true,
                    key: "address.coordinates"
                }
            })
            aggregationPets.push(
                {
                    $sort: { distance: 1}
                }
            )
        }
        const pets = await Pet.aggregate(aggregationPets);
        console.log(pets)
        // QUERY LOST PETS
        const queryAds = {
            active: true,
            pet: { $in: pets.map(pet => pet._id) }
        }
        const _ads = await LostPet.find(queryAds).populate({
            path: "pet",
            select: "_id name photos"
        }).sort({createdAt: 1}).skip(skip).limit(limit).exec();
        // ADD THE DISTANCE TO THE LOST PET
        const ads = _ads.map(ad => {
            const pet = pets.find(pet => pet._id.toString() === ad.pet._id.toString());
            return {
                ...ad._doc!,
                distance: pet.distance
            }
        })
        const totalAds = await LostPet.countDocuments(queryAds);
        // const totalAds = await LostPet.countDocuments({active: true});
        const totalPages = Math.ceil(totalAds / limit);
        // const ads = await LostPet.find({active: true}).populate({
        //     path: 'pet',
        //     select: '_id name photos'
        // }).sort({createdAt: 1}).skip(skip).limit(limit).exec();

        return res.status(200).json({
            status: true,
            totalPages: totalPages,
            data: ads
        })
    }
}