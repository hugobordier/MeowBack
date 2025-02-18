import { JwtPayload } from 'jsonwebtoken';
import type User from '../models/User';

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}
