import { NextFunction, Request, Response } from "express";
import { controller } from "../../decorators/controller.decorator";
import { Get, Post } from "../../decorators/routes.decorator";
import { Factory } from "../../models/Factory";
import { LostPet } from "../../models/LostPet/LostPet.model";
import { AuthController } from "../auth/Auth.controller";
import { use } from "../../decorators/use.decorator";




// const  {create: createLostPet, deleteOne: deleteLostPet, findAll: findAllLostPet, updateOne: updateLostPet} = Factory(LostPet)

@controller("/lost-pet")
export class LostPetController {

    @Get('/')
    @use(AuthController.protect)
    public async getAll(req: Request, res: Response, next: NextFunction) {
        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit.toString()) : 20;

        const skip = (page - 1) * limit;
        const totalAds = await LostPet.countDocuments({active: true});
        const totalPages = Math.ceil(totalAds / limit);
        const ads = await LostPet.find({active: true}).sort({createdAt: 1}).skip(skip).limit(limit).exec();

        return res.status(200).json({
            status: true,
            totalPages: totalPages,
            data: ads
        })
    }
}