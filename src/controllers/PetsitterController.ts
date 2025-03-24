import type { Request, Response } from 'express';
import PetSitterService from '../services/PetsitterService';
import PetSitter from '@/models/PetSitter';

class PetSitterController {
  static async getPetSitters(req: Request, res: Response): Promise<Response> {
    try {
      const { minRate, maxRate, minExperience, dayAvailable, search } =
        req.query;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (minRate || maxRate || minExperience || dayAvailable || search) {
        console.log('search');
        const { petsitters, totalItems } =
          await PetSitterService.searchPetSitters(
            {
              minHourlyRate: minRate
                ? parseFloat(minRate as string)
                : undefined,
              maxHourlyRate: maxRate
                ? parseFloat(maxRate as string)
                : undefined,
              minExperience: minExperience
                ? parseInt(minExperience as string)
                : undefined,
              dayAvailability: dayAvailable as string,
              search: search as string,
            },
            page,
            limit
          );
        const totalPages = Math.ceil(totalItems / limit);
        return res.status(200).json({
          success: true,
          message: 'Données récupérées avec succès',
          petsitters,
          pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
          },
        });
      } else {
        console.log('pas de search');
        const { petsitters, totalItems } =
          await PetSitterService.getAllPetSitters(page, limit);

        const totalPages = Math.ceil(totalItems / limit);

        return res.status(200).json({
          success: true,
          message: 'Données récupérées avec succès',
          petsitters,
          pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
          },
        });
      }
    } catch (error) {
      console.error('Error in getPetSitters controller:', error);

      if (error instanceof Error) {
        return res.status(500).json({
          success: false,
          message: error.message || 'Erreur interne du serveur',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
      });
    }
  }

  static async getPetSitterById(
    req: Request,
    res: Response
  ): Promise<Response> {
    const id =
      req.params.id !== '{id}'
        ? req.params.id
        : (await PetSitterService.getPetSitterByUserId(req.user!.id))?.id;
    try {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID du petsitter requis',
        });
      }

      const petsitter = await PetSitterService.getPetSitterById(id);

      if (!petsitter) {
        return res.status(404).json({
          success: false,
          message: `Petsitter avec ID ${id} non trouvé`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Données récupérées avec succès',
        petsitter,
      });
    } catch (error) {
      console.error(
        `Error in getPetSitterById controller for ID ${id}:`,
        error
      );

      if (error instanceof Error) {
        return res.status(500).json({
          success: false,
          message: error.message || 'Erreur interne du serveur',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
      });
    }
  }

  static async getPetSitterByUserId(
    req: Request,
    res: Response
  ): Promise<Response> {
    const id = req.params.id !== '{id}' ? req.params.id : req.user!.id; //work even if there isnt params BAM deux en un la route est trop cool j'ai dead ca

    try {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID utilisateur requis',
        });
      }

      const petsitter = await PetSitterService.getPetSitterByUserId(id);

      if (!petsitter) {
        return res.status(404).json({
          success: false,
          message: `Aucun petsitter trouvé pour l'utilisateur avec ID ${id}`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Données récupérées avec succès',
        petsitter,
      });
    } catch (error) {
      console.error(
        `Error in getPetSitterByUserId controller for user ID ${id}:`,
        error
      );

      if (error instanceof Error) {
        return res.status(500).json({
          success: false,
          message: error.message || 'Erreur interne du serveur',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
      });
    }
  }

  static async createPetSitter(req: Request, res: Response): Promise<Response> {
    try {
      const { bio, hourly_rate, experience, availability } = req.body;

      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié ou ID utilisateur manquant',
        });
      }

      const user_id = req.user.id;

      if (hourly_rate === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Le tarif horaire est requis',
        });
      }

      const parsedHourlyRate = parseFloat(hourly_rate);
      if (isNaN(parsedHourlyRate) || parsedHourlyRate < 0) {
        return res.status(400).json({
          success: false,
          message: 'Le tarif horaire doit être un nombre positif',
        });
      }

      const parsedExperience = experience ? parseInt(experience) : 0;
      if (isNaN(parsedExperience) || parsedExperience < 0) {
        return res.status(400).json({
          success: false,
          message: "L'expérience doit être un nombre positif",
        });
      }

      const newPetSitter = await PetSitterService.createPetSitter(
        user_id,
        bio || '',
        parsedHourlyRate,
        parsedExperience,
        availability || []
      );

      return res.status(201).json({
        success: true,
        message: 'Petsitter créé avec succès',
        petsitter: {
          id: newPetSitter.id,
          user_id: newPetSitter.user_id,
          hourly_rate: newPetSitter.hourly_rate,
        },
      });
    } catch (error) {
      console.error('Error in createPetSitter controller:', error);

      if (error instanceof Error) {
        if (error.message.includes("existe déjà pour l'utilisateur")) {
          return res.status(409).json({
            success: false,
            message: error.message,
          });
        }

        // Pour les erreurs de validation
        if (error.message.includes('Validation')) {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }

        return res.status(500).json({
          success: false,
          message: error.message || 'Erreur lors de la création du petsitter',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
      });
    }
  }

  static async updatePetSitter(req: Request, res: Response): Promise<Response> {
    const id =
      req.params.id !== '{id}'
        ? req.params.id
        : (await PetSitterService.getPetSitterByUserId(req.user!.id))?.id;
    const updateData = req.body;

    try {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID du petsitter requis',
        });
      }

      // Préparation des données à mettre à jour
      const petSitterData: Partial<PetSitter> = {};

      if (updateData.bio !== undefined) {
        petSitterData.bio = updateData.bio;
      }

      if (updateData.hourly_rate !== undefined) {
        const parsedRate = parseFloat(updateData.hourly_rate);
        if (isNaN(parsedRate) || parsedRate < 0) {
          return res.status(400).json({
            success: false,
            message: 'Le tarif horaire doit être un nombre positif',
          });
        }
        petSitterData.hourly_rate = parsedRate;
      }

      if (updateData.experience !== undefined) {
        const parsedExp = parseInt(updateData.experience);
        if (isNaN(parsedExp) || parsedExp < 0) {
          return res.status(400).json({
            success: false,
            message: "L'expérience doit être un nombre positif",
          });
        }
        petSitterData.experience = parsedExp;
      }

      if (updateData.availability !== undefined) {
        petSitterData.availability = updateData.availability;
      }

      const [updated, updatedPetSitter] =
        await PetSitterService.updatePetSitter(id, petSitterData);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Petsitter avec ID ${id} non trouvé`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Petsitter mis à jour avec succès',
        petsitter: updatedPetSitter,
      });
    } catch (error) {
      console.error(`Error in updatePetSitter controller for ID ${id}:`, error);

      if (error instanceof Error) {
        if (error.message.includes('Validation')) {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }

        return res.status(500).json({
          success: false,
          message:
            error.message || 'Erreur lors de la mise à jour du petsitter',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
      });
    }
  }

  static async deletePetSitter(req: Request, res: Response): Promise<Response> {
    const id =
      req.params.id !== '{id}'
        ? req.params.id
        : (await PetSitterService.getPetSitterByUserId(req.user!.id))?.id;

    try {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID du petsitter requis',
        });
      }

      const deleted = await PetSitterService.deletePetSitter(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Petsitter avec ID ${id} non trouvé`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Petsitter supprimé avec succès',
      });
    } catch (error) {
      console.error(`Error in deletePetSitter controller for ID ${id}:`, error);

      if (error instanceof Error) {
        return res.status(500).json({
          success: false,
          message:
            error.message || 'Erreur lors de la suppression du petsitter',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
      });
    }
  }
}

export default PetSitterController;
