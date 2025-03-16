import type { AvailabilityDay } from '@/types/type';
import PetSitter from '../models/PetSitter';
import { Op, ValidationError } from 'sequelize';

class PetSitterService {
  static async getAllPetSitters(): Promise<PetSitter[]> {
    try {
      return await PetSitter.findAll();
    } catch (error) {
      console.error('Error in getAllPetSitters:', error);
      if (error instanceof Error) {
        throw new Error(
          `Erreur lors de la récupération des petsitters: ${error.message}`
        );
      }
      throw new Error('Erreur inconnue lors de la récupération des petsitters');
    }
  }

  static async getPetSitterById(id: string): Promise<PetSitter | null> {
    try {
      if (!id) {
        throw new Error('ID du petsitter non spécifié');
      }

      const petSitter = await PetSitter.findByPk(id);

      if (!petSitter) {
        return null;
      }

      return petSitter;
    } catch (error) {
      console.error(`Error in getPetSitterById(${id}):`, error);
      if (error instanceof Error) {
        throw new Error(
          `Erreur lors de la récupération du petsitter ID ${id}: ${error.message}`
        );
      }
      throw new Error(
        `Erreur inconnue lors de la récupération du petsitter ID ${id}`
      );
    }
  }

  static async getPetSitterByUserId(userId: string): Promise<PetSitter | null> {
    try {
      if (!userId) {
        throw new Error('ID utilisateur non spécifié');
      }

      return await PetSitter.findOne({
        where: {
          user_id: userId,
        },
      });
    } catch (error) {
      console.error(`Error in getPetSitterByUserId(${userId}):`, error);
      if (error instanceof Error) {
        throw new Error(
          `Erreur lors de la récupération du petsitter pour l'utilisateur ID ${userId}: ${error.message}`
        );
      }
      throw new Error(
        `Erreur inconnue lors de la récupération du petsitter pour l'utilisateur ID ${userId}`
      );
    }
  }

  static async createPetSitter(
    user_id: string,
    bio: string,
    hourly_rate: number,
    experience: number,
    availability: AvailabilityDay[]
  ): Promise<PetSitter> {
    try {
      if (!user_id) {
        throw new Error('ID utilisateur requis pour créer un petsitter');
      }

      const existingPetSitter = await PetSitter.findOne({
        where: { user_id },
      });

      if (existingPetSitter) {
        throw new Error(
          `Un petsitter existe déjà pour l'utilisateur avec l'ID ${user_id}`
        );
      }

      if (hourly_rate < 0) {
        throw new Error('Le tarif horaire doit être un nombre positif');
      }

      if (experience < 0) {
        throw new Error("Le niveau d'expérience doit être un nombre positif");
      }

      return await PetSitter.create({
        user_id,
        bio,
        hourly_rate,
        experience,
        availability,
      });
    } catch (error) {
      console.error('Error in createPetSitter:', error);

      if (error instanceof ValidationError) {
        const validationErrors = error.errors
          .map((err) => err.message)
          .join(', ');
        throw new Error(
          `Validation échouée lors de la création du petsitter: ${validationErrors}`
        );
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Erreur inconnue lors de la création du petsitter');
    }
  }

  static async updatePetSitter(
    id: string,
    data: Partial<PetSitter>
  ): Promise<[boolean, PetSitter | null]> {
    try {
      if (!id) {
        throw new Error('ID du petsitter non spécifié pour la mise à jour');
      }

      const petSitter = await PetSitter.findByPk(id);
      if (!petSitter) {
        return [false, null];
      }

      if (data.hourly_rate !== undefined && data.hourly_rate < 0) {
        throw new Error('Le tarif horaire doit être un nombre positif');
      }

      if (data.experience !== undefined && data.experience < 0) {
        throw new Error("Le niveau d'expérience doit être un nombre positif");
      }

      const [updated] = await PetSitter.update(data, {
        where: { id },
      });

      const updatedPetSitter =
        updated > 0 ? await PetSitter.findByPk(id) : null;

      return [updated > 0, updatedPetSitter];
    } catch (error) {
      console.error(`Error in updatePetSitter(${id}):`, error);

      if (error instanceof ValidationError) {
        const validationErrors = error.errors
          .map((err) => err.message)
          .join(', ');
        throw new Error(
          `Validation échouée lors de la mise à jour du petsitter ID ${id}: ${validationErrors}`
        );
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error(
        `Erreur inconnue lors de la mise à jour du petsitter ID ${id}`
      );
    }
  }

  static async deletePetSitter(id: string): Promise<boolean> {
    try {
      if (!id) {
        throw new Error('ID du petsitter non spécifié pour la suppression');
      }

      const petSitter = await PetSitter.findByPk(id);
      if (!petSitter) {
        return false;
      }

      const deleted = await PetSitter.destroy({
        where: { id },
      });

      return deleted > 0;
    } catch (error) {
      console.error(`Error in deletePetSitter(${id}):`, error);
      if (error instanceof Error) {
        throw new Error(
          `Erreur lors de la suppression du petsitter ID ${id}: ${error.message}`
        );
      }
      throw new Error(
        `Erreur inconnue lors de la suppression du petsitter ID ${id}`
      );
    }
  }

  static async searchPetSitters(criteria: {
    minHourlyRate?: number;
    maxHourlyRate?: number;
    minExperience?: number;
    dayAvailability?: string;
  }): Promise<PetSitter[]> {
    try {
      const whereClause: any = {};

      if (
        criteria.minHourlyRate !== undefined ||
        criteria.maxHourlyRate !== undefined
      ) {
        whereClause.hourly_rate = {};

        if (criteria.minHourlyRate !== undefined) {
          whereClause.hourly_rate[Op.gte] = criteria.minHourlyRate;
        }

        if (criteria.maxHourlyRate !== undefined) {
          whereClause.hourly_rate[Op.lte] = criteria.maxHourlyRate;
        }
      }

      if (criteria.minExperience !== undefined) {
        whereClause.experience = {
          [Op.gte]: criteria.minExperience,
        };
      }

      return await PetSitter.findAll({
        where: whereClause,
      });
    } catch (error) {
      console.error('Error in searchPetSitters:', error);
      if (error instanceof Error) {
        throw new Error(
          `Erreur lors de la recherche de petsitters: ${error.message}`
        );
      }
      throw new Error('Erreur inconnue lors de la recherche de petsitters');
    }
  }
}

export default PetSitterService;
