import { NextFunction, Request, Response } from "express";
import { controller } from "../../decorators/controller.decorator";
import { Delete, Get, Patch, Post } from "../../decorators/routes.decorator";
import { use } from "../../decorators/use.decorator";
import { AuthController } from "../auth/Auth.controller";
import { v4 } from 'uuid'
import QRCode from 'qrcode'
import {QrCode} from '../../models/qrCode/QrCode.model'
import { EEncodedTypes, Image } from "../../models/image/Image.model";
import { Pet } from "../../models/pet/Pet.model";
import { AppError } from "../../error/AppError";
import { User } from "../../models/user/User.model";
import {Types} from 'mongoose'




@controller("/qr")
export class QrController {

    @Post('/generate')
    @use(AuthController.protect)
    public async generate (req:Request, res:Response, next: NextFunction) {
        const uuid = v4()
        const url = `https://tail-spot.com/qr/${uuid}`;
        const qrCodeImage = await QRCode.toDataURL(url);
        const image = await Image.create({
            src: qrCodeImage,
            contentType: 'string',
            encoded: EEncodedTypes.BUFFER
        });
        const qr = await QrCode.create({
            id: uuid,
            image: image
        })
        res.status(201).end()
    }

    @Get("/:qrId/pet")
    public async getPetByQr (req:Request, res:Response, next:NextFunction) {
        const qrId = req.params.qrId;
        const qr = await QrCode.findOne({id: qrId}).select('pet');
        if(!qr) return next( new AppError("This QR is not Found", 404));
        if(!qr.pet) return next( new AppError("This QR is not assigned to a Pet", 404))
        const pet = await Pet.findById(qr.pet);
        if(!pet) return next (new AppError("No pet FOUND", 404));
        return res.status(200).json({
            status: true,
            data: pet
        })
    }

    @Patch("/:qrId/pet/:petId")
    @use(AuthController.protect)
    public async assignedPet(req:Request, res:Response, next:NextFunction){
        const qrId = req.params.qrId;
        const qr = await QrCode.findOne({id: qrId}).select('pet user');
        if(!qr) return next( new AppError("This QR is not Found", 404));
        console.log(qr.user)
        if(qr.user){
            const userQr = await User.findById(qr.user)
            console.log(userQr)
            if(userQr?.id != req.user.id) return next( new AppError(`This necklace is already own by another person please tell him to unlock it or if return the necklace using this number: ${userQr?.phone}`, 404));
        }
        if(qr.pet) return next( new AppError("This QR is already assigned to a Pet", 400));
        const possibleQr = await QrCode.find({pet: req.params.petId});
        if(possibleQr && possibleQr.length > 0) return next(new AppError("This Pet is already assigned", 400));
        qr.pet = req.params.petId;
        qr.user = req.user.id;
        await qr.save()
        return res.status(200).json({
            status: true,
            message: "QR CODE correctly assigned to Pet"
        })

    }

    @Delete("/:qrId/pet/:petId")
    @use(AuthController.protect)
    public async unassignedPet(req:Request, res:Response, next:NextFunction){
        const qrId = req.params.qrId;
        const qr = await QrCode.findOne({id: qrId}).select("pet user");
        if(!qr) return next(new AppError("This QR doesn't exists", 404))
        if(!qr.user) return next(new AppError("This Qr doesn't belong to a user", 404))
        if(qr.user.toString() !== req.user.id) return next(new AppError("This Qr doesn't belong to you", 400))
        if(!qr.pet) return next(new AppError("This Qr doesn't have a Pet assigned", 400)) 
        qr.pet = ""
        await qr.save()
        return res.status(204).json({})
    }

    @Delete("/:qrId")
    @use(AuthController.protect)
    public async unassignedUser(req:Request, res: Response, next:NextFunction){
        const qrId = req.params.qrId;
        const qr = await QrCode.findOne({id: qrId}).select("pet user");
        if(!qr) return next(new AppError("This QR doesn't exists", 404))
        if(!qr.user) return next(new AppError("This Qr doesn't belong to a user", 404))
        if(qr.user.toString() !== req.user.id) return next(new AppError("This Qr doesn't belong to you", 400))
        qr.pet = ""
        qr.user = ""
        await qr.save()
        return res.status(204).json({})
    }
}