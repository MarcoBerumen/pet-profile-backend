import { controller } from '../../decorators/controller.decorator';
import { NextFunction, Request, Response } from 'express';
import { Delete, Get, Patch, Post } from '../../decorators/routes.decorator';
import { Factory } from '../../models/Factory';
import { use } from '../../decorators/use.decorator';
import { AuthController } from '../auth/Auth.controller';
import { IPetDocument, Pet } from '../../models/pet/Pet.model';
import { AppError } from '../../error/AppError';
import { Multer } from '../../config/multer';
import { EEncodedTypes, Image } from '../../models/image/Image.model';
import { Document } from 'mongoose';
import { ENVS } from '../../config/config';
import { LostPet } from '../../models/LostPet/LostPet.model';
import { MyDate } from '../../utils/Date';

const { create, deleteOne, findAll, updateOne } = Factory(Pet);
const  {create: createLostPet, deleteOne: deleteLostPet, findAll: findAllLostPet, updateOne: updateLostPet, findOneById: findOneLosPet} = Factory(LostPet)
const { createMany: createImages, deleteOne: deleteImageModel } =
  Factory(Image);

@controller('/pet')
export class PetController {
  @Post('/')
  @use(AuthController.protect)
  public create(req: Request, res: Response, next: NextFunction) {
    req.body = { ...req.body, owner: req.user.id };
    return create()(req, res, next);
  }
  @Delete('/:id')
  @use(AuthController.protect)
  public async deletePet(req: Request, res: Response, next: NextFunction) {
    const pet = Pet.findById(req.params.id);
    if (!pet) return next(new AppError('No pet found', 404));
    await pet.updateOne({ active: false });
    res.status(204).end();
  }
  @Get('/')
  @use(AuthController.protect)
  public async getAll(req: Request, res: Response, next: NextFunction) {
    const query = { owner: req.user.id, "address.coordinates": undefined } as any;
    const {latitude, longitude} = req.query;
    if(latitude && longitude) {
      query["address.coordinates"] = {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: 5000//ffgvf
        }
      }
    }
    const docs = await Pet.find(query);
    return res.status(200).json({ status: true, pet: docs });
    // return await findAll()(query, res, next);
  }
  @Patch('/:id')
  @use(AuthController.protect)
  public async update(req: Request, res: Response, next: NextFunction) {
    return updateOne()(req, res, next);
  }

  @Post("/:id/lost")
  @use( AuthController.protect)
  public async createLostAd(req:Request, res:Response, next:NextFunction){
    req.body = {...req.body, pet: req.params.id}
    const lostPet = await LostPet.findOne({pet: req.params.id, active: true})
    if(lostPet && lostPet.active) return next(new AppError("This Pet already has a Lost Ad", 400));
    const date = req.body.date;
    if(date){
      const dateObject = new Date(date);
      if(!MyDate.isValid(dateObject)) return next(new AppError("Wrong date provided", 400))
      req.body.date = dateObject;
    }
    return createLostPet()(req,res,next)
  }

  @Delete("/:id/lost")
  @use(AuthController.protect)
  public async deleteLosAd(req:Request, res:Response, next:NextFunction) {
    const lostAd = await LostPet.findOne({pet: req.params.id, active: true});
    if(!lostAd) return next(new AppError("This peto doesn't have an active lost ad", 400))
    lostAd.active = false;
    await lostAd.save()
    return res.status(204).end()
  }
  
  @Patch("/:lostPet/lost/:id")
  @use( AuthController.protect)
  public async updateLostAd(req:Request, res:Response, next:NextFunction){
    // req.body = {...req.body}
    return updateLostPet()(req,res,next)
  }

  @Post('/:id/image')
  @use(AuthController.protect)
  @use(Multer.getInstance().upload.array('images'))
  public async uploadImage(req: Request, res: Response, next: NextFunction) {
    if (!req.files) {
      return next(new AppError('No files Uploaded', 404));
    }

    const pet = await Pet.findById(req.params.id);

    if (!pet) return next(new AppError('No pet found', 404));
    if (!req.files) return next(new AppError('No files sent', 400));
    if (pet.photos.length >= 3)
      return next(new AppError("You've already uploaded 3 images", 400));

    const photosToBeUploaded = req.files.length as number;
    if (pet.photos.length + photosToBeUploaded > 3)
      return next(new AppError('You can only have 3 photos per pet', 400));


    const images = (req.files as Array<Express.Multer.File>).map((file) => ({
      src: file.buffer,
      contentType: file.mimetype,
      encoded: process.env.NODE_ENV === ENVS.DEVELOPMENT ? EEncodedTypes.BUFFER : EEncodedTypes.HTTPURL
    }));
    req.body = images;
    const savedImages = await createImages()(req, res, next);
    const imagesIds = savedImages.reduce(
      (accumulator: Array<number>, currentValue: any) => {
        accumulator.push(currentValue.id);
        return accumulator;
      },
      []
    );
    req.body = {
      photos: imagesIds,
    };

    await pet.updateOne(
      { $addToSet: { photos: { $each: imagesIds } } },
      { new: true, useFindAndModify: false }
    );

    res.status(204).json({ status: true, message: 'Photo correctly added' });
  }

  @Delete('/:id/image/:imageId')
  @use(AuthController.protect)
  public async deleteImage(req: Request, res: Response, next: NextFunction) {
    const pet = await Pet.findById(req.params.id);

    if (!pet) return next(new AppError('No pet found', 404));

    if (pet.photos.length < 1)
      return next(new AppError('No image to delete', 400));

    const image = await Image.findById(req.params.imageId);

    if (!image) return next(new AppError('No image to delete', 404));

    await image.deleteOne();

    res.status(204).end();
  }
}
