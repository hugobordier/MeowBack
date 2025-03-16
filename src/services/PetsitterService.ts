import PetSitter from '@/models/PetSitter';

export default class PetsitterService {
  static async getPetSitters() {
    try {
      return await PetSitter.findAll();
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des pet-sitters : ${error}`
      );
    }
  }
}
