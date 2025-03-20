import type { Request, Response } from 'express';
import pets from '@/models/pets';
class PetController{
    static async createPet(req : Request, res : Response){
        try{
            const pet = await pets.create(req.body)
        }
    }catch(error){

    }

    

}