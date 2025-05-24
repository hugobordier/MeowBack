import type { Request, Response } from 'express';
import { ApiResponse, HttpStatusCode } from '../utils/ApiResponse';
import PetSitterService from '../services/PetsitterService';
import PetSitter from '@/models/PetSitter';
import { getCoordinatesFromAddress } from '@utils/geocoding';

class PetSitterController {
  static async getPetSitters(req: Request, res: Response): Promise<Response> {
    try {
      // Extract all query parameters
      const {
        page: pageParam,
        limit: limitParam,
        search,
        minRate,
        maxRate,
        minExperience,
        animal_types,
        services,
        latitude,
        longitude,
        radius,
        availability_days,
        availability_intervals,
      } = req.query;

      const page = parseInt(pageParam as string) || 1;
      const limit = parseInt(limitParam as string) || 10;

      const filters: any = {
        search: search as string,
        minHourlyRate: minRate ? parseFloat(minRate as string) : undefined,
        maxHourlyRate: maxRate ? parseFloat(maxRate as string) : undefined,
        minExperience: minExperience
          ? parseInt(minExperience as string)
          : undefined,
      };

      if (availability_days) {
        filters.availability_days = Array.isArray(availability_days)
          ? availability_days
          : [availability_days];
      }

      if (availability_intervals) {
        filters.availability_intervals = Array.isArray(availability_intervals)
          ? availability_intervals
          : [availability_intervals];
      }
      if (animal_types) {
        let animalTypesFilter;

        try {
          if (Array.isArray(animal_types)) {
            animalTypesFilter = animal_types;
          } else if (typeof animal_types === 'string') {
            if (animal_types.startsWith('[')) {
              animalTypesFilter = JSON.parse(animal_types);
            } else {
              animalTypesFilter = [animal_types];
            }
          } else {
            animalTypesFilter = [animal_types];
          }

          filters.animalTypes = animalTypesFilter;
        } catch (error) {
          console.error('Error parsing animal_types filter:', error);
          return ApiResponse.badRequest(
            res,
            "Format de types d'animaux invalide"
          );
        }
      }

      if (services) {
        let servicesFilter;

        try {
          if (Array.isArray(services)) {
            servicesFilter = services;
          } else if (typeof services === 'string') {
            if (services.startsWith('[')) {
              servicesFilter = JSON.parse(services);
            } else {
              servicesFilter = [services];
            }
          } else {
            servicesFilter = [services];
          }

          filters.services = servicesFilter;
        } catch (error) {
          console.error('Error parsing services filter:', error);
          return ApiResponse.badRequest(res, 'Format de services invalide');
        }
      }

      if (latitude && longitude) {
        filters.latitude = parseFloat(latitude as string);
        filters.longitude = parseFloat(longitude as string);

        if (radius) {
          filters.radius = parseFloat(radius as string);
        } else {
          filters.radius = 10; // 10km default radius
        }
      }

      // Check if any filters are applied
      const hasFilters = Object.values(filters).some(
        (value) => value !== undefined
      );

      let petsitters, totalItems;
      if (hasFilters) {
        console.log('filter : ', filters);
        ({ petsitters, totalItems } = await PetSitterService.searchPetSitters(
          filters,
          page,
          limit
        ));
      } else {
        ({ petsitters, totalItems } = await PetSitterService.getAllPetSitters(
          page,
          limit
        ));
      }

      const pagination = ApiResponse.createPagination(totalItems, page, limit);

      return ApiResponse.ok(
        res,
        'Données récupérées avec succès',
        { petsitters },
        pagination
      );
    } catch (error) {
      console.error('Error in getPetSitters controller:', error);

      return ApiResponse.internalServerError(
        res,
        error instanceof Error ? error.message : 'Erreur interne du serveur',
        { error }
      );
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
        return ApiResponse.badRequest(res, 'ID du petsitter requis');
      }

      const petsitter = await PetSitterService.getPetSitterById(id);

      if (!petsitter) {
        return ApiResponse.notFound(res, `Petsitter avec ID ${id} non trouvé`);
      }

      return ApiResponse.ok(res, 'Données récupérées avec succès', {
        petsitter,
      });
    } catch (error) {
      console.error(
        `Error in getPetSitterById controller for ID ${id}:`,
        error
      );

      return ApiResponse.internalServerError(
        res,
        error instanceof Error ? error.message : 'Erreur interne du serveur',
        { error }
      );
    }
  }

  static async getPetSitterByUserId(
    req: Request,
    res: Response
  ): Promise<Response> {
    const id = req.params.id !== '{id}' ? req.params.id : req.user!.id;

    try {
      if (!id) {
        return ApiResponse.badRequest(res, 'ID utilisateur requis');
      }

      const petsitter = await PetSitterService.getPetSitterByUserId(id);

      if (!petsitter) {
        return ApiResponse.notFound(
          res,
          `Aucun petsitter trouvé pour l'utilisateur avec ID ${id}`
        );
      }

      return ApiResponse.ok(res, 'Données récupérées avec succès', {
        petsitter,
      });
    } catch (error) {
      console.error(
        `Error in getPetSitterByUserId controller for user ID ${id}:`,
        error
      );

      return ApiResponse.internalServerError(
        res,
        error instanceof Error ? error.message : 'Erreur interne du serveur',
        { error }
      );
    }
  }

  static async createPetSitter(req: Request, res: Response): Promise<Response> {
    try {
      const {
        bio,
        hourly_rate,
        experience,
        available_days,
        available_slots,
        animal_types,
        services,
      } = req.body;

      if (!req.user || !req.user.id) {
        return ApiResponse.unauthorized(
          res,
          'Utilisateur non authentifié ou ID utilisateur manquant'
        );
      }

      const user_id = req.user.id;

      if (hourly_rate === undefined) {
        return ApiResponse.badRequest(res, 'Le tarif horaire est requis');
      }

      const parsedHourlyRate = parseFloat(hourly_rate);
      if (isNaN(parsedHourlyRate) || parsedHourlyRate < 0) {
        return ApiResponse.badRequest(
          res,
          'Le tarif horaire doit être un nombre positif'
        );
      }

      const parsedExperience = experience ? parseInt(experience) : 0;
      if (isNaN(parsedExperience) || parsedExperience < 0) {
        return ApiResponse.badRequest(
          res,
          "L'expérience doit être un nombre positif"
        );
      }

      // Validation des arrays
      if (available_days && !Array.isArray(available_days)) {
        return ApiResponse.badRequest(
          res,
          'available_days doit être un tableau'
        );
      }
      if (available_days) {
        const validDays = [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ];
        const invalidDays = available_days.filter(
          (d: string) => !validDays.includes(d)
        );
        if (invalidDays.length > 0) {
          return ApiResponse.badRequest(
            res,
            `Jours invalides dans available_days: ${invalidDays.join(', ')}`
          );
        }
      }

      if (available_slots && !Array.isArray(available_slots)) {
        return ApiResponse.badRequest(
          res,
          'available_slots doit être un tableau'
        );
      }
      if (available_slots) {
        const validSlots = ['Matin', 'Après-midi', 'Soir', 'Nuit'];
        const invalidSlots = available_slots.filter(
          (s: string) => !validSlots.includes(s)
        );
        if (invalidSlots.length > 0) {
          return ApiResponse.badRequest(
            res,
            `Créneaux invalides dans available_slots: ${invalidSlots.join(', ')}`
          );
        }
      }

      if (animal_types && !Array.isArray(animal_types)) {
        return ApiResponse.badRequest(res, 'animal_types doit être un tableau');
      }

      if (services && !Array.isArray(services)) {
        return ApiResponse.badRequest(res, 'services doit être un tableau');
      }

      // Récupération des coordonnées, ici on utilise l'adresse user si lat/lon non fournis dans req.body
      let latitude = null;
      let longitude = null;

      if (req.body.latitude !== undefined && req.body.longitude !== undefined) {
        latitude = parseFloat(req.body.latitude);
        longitude = parseFloat(req.body.longitude);
        if (
          isNaN(latitude) ||
          latitude < -90 ||
          latitude > 90 ||
          isNaN(longitude) ||
          longitude < -180 ||
          longitude > 180
        ) {
          return ApiResponse.badRequest(res, 'Latitude ou longitude invalides');
        }
      } else if (req.user.address) {
        const coords = await getCoordinatesFromAddress(req.user.address);
        latitude = coords.lat;
        longitude = coords.lon;
      }

      const newPetSitter = await PetSitterService.createPetSitter(
        user_id,
        bio || '',
        parsedHourlyRate,
        parsedExperience,
        available_days || [],
        available_slots || [],
        latitude,
        longitude,
        animal_types || [],
        services || []
      );

      return ApiResponse.created(res, 'Petsitter créé avec succès', {
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
          return ApiResponse.badRequest(res, error.message);
        }

        if (error.message.includes('Validation')) {
          return ApiResponse.badRequest(res, error.message);
        }

        return ApiResponse.internalServerError(
          res,
          error.message || 'Erreur lors de la création du petsitter',
          { error }
        );
      }

      return ApiResponse.internalServerError(res, 'Erreur interne du serveur');
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
        return ApiResponse.badRequest(res, 'ID du petsitter requis');
      }

      const petSitterData: Partial<PetSitter> = {};

      if (updateData.bio !== undefined) {
        petSitterData.bio = updateData.bio;
      }

      if (updateData.hourly_rate !== undefined) {
        const parsedRate = parseFloat(updateData.hourly_rate);
        if (isNaN(parsedRate) || parsedRate < 0) {
          return ApiResponse.badRequest(
            res,
            'Le tarif horaire doit être un nombre positif'
          );
        }
        petSitterData.hourly_rate = parsedRate;
      }

      if (updateData.experience !== undefined) {
        const parsedExp = parseInt(updateData.experience);
        if (isNaN(parsedExp) || parsedExp < 0) {
          return ApiResponse.badRequest(
            res,
            "L'expérience doit être un nombre positif"
          );
        }
        petSitterData.experience = parsedExp;
      }

      if (updateData.availability_days !== undefined) {
        if (!Array.isArray(updateData.availability_days)) {
          return ApiResponse.badRequest(
            res,
            'availability_days doit être un tableau'
          );
        }
        petSitterData.available_days = updateData.availability_days;
      }

      if (updateData.availability_intervals !== undefined) {
        if (!Array.isArray(updateData.availability_intervals)) {
          return ApiResponse.badRequest(
            res,
            'availability_intervals doit être un tableau'
          );
        }
        const validSlots = ['Matin', 'Après-midi', 'Soir', 'Nuit'];
        const invalidSlots = updateData.availability_intervals.filter(
          (slot: string) => !validSlots.includes(slot)
        );
        if (invalidSlots.length > 0) {
          return ApiResponse.badRequest(
            res,
            `availability_intervals contient des valeurs invalides : ${invalidSlots.join(', ')}`
          );
        }
        petSitterData.available_slots = updateData.availability_intervals;
      }

      if (updateData.animal_types !== undefined) {
        if (!Array.isArray(updateData.animal_types)) {
          return ApiResponse.badRequest(
            res,
            'animal_types doit être un tableau'
          );
        }
        petSitterData.animal_types = updateData.animal_types;
      }

      if (updateData.services !== undefined) {
        if (!Array.isArray(updateData.services)) {
          return ApiResponse.badRequest(res, 'services doit être un tableau');
        }
        petSitterData.services = updateData.services;
      }

      const [updated, updatedPetSitter] =
        await PetSitterService.updatePetSitter(id, petSitterData);

      if (!updated) {
        return ApiResponse.notFound(res, `Petsitter avec ID ${id} non trouvé`);
      }

      return ApiResponse.ok(res, 'Petsitter mis à jour avec succès', {
        petsitter: updatedPetSitter,
      });
    } catch (error) {
      console.error(`Error in updatePetSitter controller for ID ${id}:`, error);

      if (error instanceof Error) {
        if (error.message.includes('Validation')) {
          return ApiResponse.badRequest(res, error.message);
        }

        return ApiResponse.internalServerError(
          res,
          error.message || 'Erreur lors de la mise à jour du petsitter',
          { error }
        );
      }

      return ApiResponse.internalServerError(res, 'Erreur interne du serveur');
    }
  }

  static async deletePetSitter(req: Request, res: Response): Promise<Response> {
    const id =
      req.params.id !== '{id}'
        ? req.params.id
        : (await PetSitterService.getPetSitterByUserId(req.user!.id))?.id;

    try {
      if (!id) {
        return ApiResponse.badRequest(res, 'ID du petsitter requis');
      }

      const deleted = await PetSitterService.deletePetSitter(id);

      if (!deleted) {
        return ApiResponse.notFound(res, `Petsitter avec ID ${id} non trouvé`);
      }

      return ApiResponse.ok(res, 'Petsitter supprimé avec succès');
    } catch (error) {
      console.error(`Error in deletePetSitter controller for ID ${id}:`, error);

      if (error instanceof Error) {
        return ApiResponse.internalServerError(
          res,
          error.message || 'Erreur lors de la suppression du petsitter',
          { error }
        );
      }

      return ApiResponse.internalServerError(res, 'Erreur interne du serveur');
    }
  }
}

export default PetSitterController;
