import { ApiResponse } from '@utils/ApiResponse';
import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateSchema =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return ApiResponse.badRequest(res, 'Invalid request data', {
          error: error.errors,
        });
      }
      next(error);
    }
  };
