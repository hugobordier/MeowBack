import multer, { type FileFilterCallback } from 'multer';
import path from 'path';

import type {
  Response,
  Request,
  NextFunction,
} from 'express-serve-static-core';
import { ApiResponse } from '@utils/ApiResponse';

const singleImageUpload = multer({
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Seuls les fichiers image sont autorisés.'));
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error('Seuls les fichiers JPG, PNG, GIF et WEBP sont autorisés.'));
    }

    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
}).single('file');

const multipleImageUpload = multer({
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Seuls les fichiers image sont autorisés.'));
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error('Seuls les fichiers JPG, PNG, GIF et WEBP sont autorisés.'));
    }

    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Mo par fichier
    files: 5, // Limite de 5 fichiers
  },
}).array('files', 5);

//Middleware qui sert a la validation du documenet envoyé ( pour eviter les .exe par exemple)

export const uploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  singleImageUpload(req, res, (err) => {
    if (err) {
      console.log('error in uploadMiddleware: ', err);
      return ApiResponse.badRequest(res, err.message);
    }
    next();
  });
};

export const multipleUploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  multipleImageUpload(req, res, (err) => {
    if (err) {
      return ApiResponse.badRequest(res, err.message);
    }
    console.log('files', req.files);
    next();
  });
};
