import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../error/AppError';

export const Factory = <T>(model: mongoose.Model<T>) => {
  const deleteOne = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.params.id)
        return next(new AppError('No id Found in url path parameters', 404));
      const doc = await model.findByIdAndDelete(req.params.id);

      if (!doc)
        return next(new AppError('No document found with this id', 404));

      res.status(204).json({});
    };
  };

  return {
    deleteOne,
  };
};

// export class _Factory<T> {
//   model: mongoose.Model<T>;

//   public constructor(model: mongoose.Model<T>) {
//     this.model = model;
//   }

//   async getOne(populateOptions: undefined | any = undefined) {
//     return async (req: Request, res: Response, next: NextFunction) => {
//       if (!req.params.id)
//         return next(new AppError('No id Found in url path parameters', 404));
//       let query: any = this.model.findById(req.params.id);
//       if (populateOptions) query = query.populate(populateOptions);

//       const doc = await query;

//       //IF NO DOC FOUND RETURN IMMEDIATELY
//       if (!doc)
//         return next(new AppError('No document found with that ID', 404));

//       res.status(200).json({
//         ok: true,
//         data: {
//           doc,
//         },
//       });
//     };
//   }

//   async deleteOne() {
//     return async (req: Request, res: Response, next: NextFunction) => {
//       if (!req.params.id)
//         return next(new AppError('No id Found in url path parameters', 404));
//       const doc = await this.model.findByIdAndDelete(req.params.id);

//       if (!doc)
//         return next(new AppError('No document found with this id', 404));

//       res.status(204).json({});
//     };
//   }
// }
