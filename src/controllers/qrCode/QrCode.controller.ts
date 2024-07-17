import { NextFunction, Request, Response } from "express";
import { controller } from "../../decorators/controller.decorator";
import { Post } from "../../decorators/routes.decorator";
import { use } from "../../decorators/use.decorator";
import { AuthController } from "../auth/Auth.controller";
import { v4 } from 'uuid'
import QRCode from 'qrcode'
import {QrCode} from '../../models/qrCode/QrCode.model'
import { EEncodedTypes, Image } from "../../models/image/Image.model";




@controller("/qr")
export class QrController {

    @Post('/generate')
    @use(AuthController.protect)
    public async generate (req:Request, res:Response, next: NextFunction) {
        const uuid = v4()
        const url = `https://huellitas.com/qr/${uuid}`;
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
}