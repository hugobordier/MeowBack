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
        const stringError = error.errors
          .map((e) => {
            return e.message;
          })
          .join(',');
        return ApiResponse.badRequest(res, stringError, {
          error: error.errors,
        });
      }
      next(error);
    }
  };

export const validateQuery =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedQuery = schema.parse(req.query);
      Object.assign(req.query, parsedQuery); // ✅ mutation douce de l'objet
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const stringError = error.errors.map((e) => e.message).join(', ');
        return ApiResponse.badRequest(res, stringError, {
          error: error.errors,
        });
      }
      next(error);
    }
  };
