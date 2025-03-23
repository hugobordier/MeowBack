import type { Request, Response } from 'express';

import PetService from '@/services/PetService';
class PetController{

    static async createPet(req: Request, res: Response) {
      try {
        const newPet = await PetService.createPet(req.body);
        return res.status(201).json(newPet);
      } catch (error) {
        return res.status(400).json({ error: error instanceof Error ? error.message : "Erreur dans la création de l'animal" });
      }
    }


    static async getAllPets(req: Request, res: Response) {
      try {
        const pets = await PetService.getAllPets();
        return res.status(200).json(pets);
      } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la récupération des animaux" });
      }
    }
    
  
    static async getPetById(req: Request, res: Response) {
      try {
        const { id } = req.params;
        const pet = await PetService.getPetById(id);
        if (!pet) {
          return res.status(404).json({ error: "Animal non trouvé" });
        }
        return res.status(200).json(pet);
      } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la récupération de l'animal" });
      }
    }
  
    static async updatePet(req: Request, res: Response) {
      try {
        const { id } = req.params;
        const updatedPet = await PetService.updatePet(id, req.body);
        if (!updatedPet) {
          return res.status(404).json({ error: "Animal non trouvé" });
        }
        return res.status(200).json(updatedPet);
      } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la mise à jour de l'animal" });
      }
    }
  
    static async deletePet(req: Request, res: Response) {
      try {
        const { id } = req.params;
        const deleted = await PetService.deletePet(id);
        if (!deleted) {
          return res.status(404).json({ error: "Animal non trouvé" });
        }
        return res.status(200).json({ message: "Animal supprimé avec succès" });
      } catch (error) {
        return res.status(500).json({ error: "Erreur lors de la suppression de l'animal" });
      }
    }
  }
  
export default PetController;