import type { Request, Response } from 'express';
import PetsitterService from '../services/PetsitterService';

export default class PetsitterController {
  static async getPetSitters(req: Request, res: Response) {
    try {
      const data = await PetsitterService.getPetSitters();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
