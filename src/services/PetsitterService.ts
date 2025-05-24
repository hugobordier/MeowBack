import type { AvailabilityDay } from '@/types/type';
import PetSitter from '../models/PetSitter';
import { Op, Sequelize, ValidationError } from 'sequelize';
import UserService from './UserService';
import User from '@/models/User';
import ApiError from '@utils/ApiError';
import { getCoordinatesFromAddress } from '@utils/geocoding';

class PetSitterService {
  static async getAllPetSitters(
    page: any,
    limit: any
  ): Promise<{
    petsitters: { petsitter: PetSitter; user: User | null }[];
    totalItems: number;
  }> {
    const offset = (page - 1) * limit;
    try {
      const { count, rows } = await PetSitter.findAndCountAll({
        limit,
        offset,
      });

      const petsitterWithUser = await Promise.all(
        rows.map(async (r) => {
          const user = await UserService.getUserById(r.user_id);
          return {
            petsitter: r,
            user,
          };
        })
      );
      return {
        petsitters: petsitterWithUser,
        totalItems: count,
      };
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
    available_days: string[],
    available_slots: string[],
    lat: number | null,
    lon: number | null,
    animal_types: string[] = [],
    services: string[] = []
  ): Promise<PetSitter> {
    if (!user_id) {
      throw new Error('ID utilisateur requis pour créer un petsitter');
    }

    const existingPetSitter = await PetSitter.findOne({ where: { user_id } });
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

    try {
      return await PetSitter.create({
        user_id,
        bio,
        hourly_rate,
        experience,
        available_days,
        available_slots,
        latitude: lat,
        longitude: lon,
        animal_types,
        services,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        const validationErrors = error.errors.map((e) => e.message).join(', ');
        throw new Error(`Validation échouée : ${validationErrors}`);
      }
      throw error;
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

  static async searchPetSitters(
    criteria: {
      minHourlyRate?: number;
      maxHourlyRate?: number;
      minExperience?: number;
      search?: string;
      animalTypes?: string[];
      services?: string[];
      latitude?: number;
      longitude?: number;
      radius?: number;
      availability_days?: string[];
      availability_intervals?: string[];
    },
    page: number,
    limit: number
  ): Promise<{
    petsitters: {
      petsitter: PetSitter;
      user: User | null;
    }[];
    totalItems: number;
  }> {
    const offset = (page - 1) * limit;
    try {
      const whereClause: any = {};
      let includeArray: any[] = [
        {
          model: User,
          as: 'user',
          required: criteria.search ? true : false,
          where: criteria.search
            ? {
                [Op.or]: [
                  { username: { [Op.like]: `%${criteria.search}%` } },
                  { email: { [Op.like]: `%${criteria.search}%` } },
                  { lastName: { [Op.like]: `%${criteria.search}%` } },
                  { firstName: { [Op.like]: `%${criteria.search}%` } },
                ],
              }
            : undefined,
        },
      ];

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

      if (criteria.animalTypes && criteria.animalTypes.length > 0) {
        whereClause[Op.and] = whereClause[Op.and] || [];
        whereClause[Op.and].push(
          Sequelize.literal(
            `animal_types && ARRAY[${criteria.animalTypes.map((t) => `'${t}'`).join(',')}]::text[]`
          )
        );
      }

      if (criteria.services && criteria.services.length > 0) {
        whereClause[Op.and] = whereClause[Op.and] || [];
        whereClause[Op.and].push(
          Sequelize.literal(
            `services && ARRAY[${criteria.services.map((s) => `'${s}'`).join(',')}]::text[]`
          )
        );
      }
      //@ts-ignore
      console.log('criteria:', criteria.availability_days);
      if (criteria.availability_days && criteria.availability_days.length > 0) {
        console.log('test1');
        whereClause[Op.and] = whereClause[Op.and] || [];
        whereClause[Op.and].push(
          Sequelize.literal(
            `available_days && ARRAY[${criteria.availability_days
              .map((day) => `'${day}'`)
              .join(',')}]::text[]`
          )
        );
      }

      if (
        criteria.availability_intervals &&
        criteria.availability_intervals.length > 0
      ) {
        console.log('test2');
        whereClause[Op.and] = whereClause[Op.and] || [];
        whereClause[Op.and].push(
          Sequelize.literal(
            `available_slots && ARRAY[${criteria.availability_intervals
              .map((slot) => `'${slot}'`)
              .join(',')}]::text[]`
          )
        );
      }

      // Filtering by location (using Sequelize literal for distance calculation)
      if (
        criteria.latitude !== undefined &&
        criteria.longitude !== undefined &&
        criteria.radius !== undefined
      ) {
        const haversine = `
      (
        6371 * acos(
          cos(radians(${criteria.latitude})) 
          * cos(radians(latitude)) 
          * cos(radians(longitude) - radians(${criteria.longitude})) 
          + sin(radians(${criteria.latitude})) 
          * sin(radians(latitude))
        )
      )
    `;

        const locationCondition = Sequelize.literal(
          `${haversine} <= ${criteria.radius}`
        );

        whereClause[Op.and] = whereClause[Op.and] || [];
        whereClause[Op.and].push(locationCondition);

        whereClause.latitude = { [Op.ne]: null };
        whereClause.longitude = { [Op.ne]: null };
      }

      const queryOptions: any = {
        where: whereClause,
        include: includeArray,
        limit,
        offset,
        distinct: true, // Important when including multiple associations
        subQuery: false, // Can help with complex queries performance
      };

      const { count, rows } = await PetSitter.findAndCountAll(queryOptions);

      const petsitterWithUser = await Promise.all(
        rows.map(async (petsitter) => {
          const user = await UserService.getUserById(petsitter.user_id);
          return {
            petsitter,
            user,
          };
        })
      );

      return {
        petsitters: petsitterWithUser,
        totalItems: count,
      };
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
  static async updatePetSitterGeoLocation(id: string, address: string) {
    try {
      if (!id) {
        throw ApiError.badRequest(
          'ID du petsitter non spécifié pour la mise à jour'
        );
      }

      const result = await getCoordinatesFromAddress(address);

      const { lat, lon } = result;

      // Mettre à jour la géolocalisation du petsitter
      const [updated] = await PetSitter.update(
        { latitude: lat, longitude: lon },
        {
          where: { user_id: id },
        }
      );

      return updated > 0;
    } catch (error) {
      console.error(`Error in updatePetSitterGeoLocation(${id}):`, error);
      if (error instanceof Error) {
        throw ApiError.badRequest(
          `Erreur lors de la mise à jour de la géolocalisation du petsitter ID ${id}: ${error.message}`
        );
      }
      throw ApiError.internal(
        `Erreur inconnue lors de la mise à jour de la géolocalisation du petsitter ID ${id}`
      );
    }
  }
}

export default PetSitterService;
