import type { UploadApiResponse, UploadApiOptions } from 'cloudinary';
import cloudinary, { FolderName } from '@/config/cloudinary.config';

class CloudinaryService {
  /**
   * Upload une image à Cloudinary depuis un buffer (mémoire)
   * @param file Le fichier sous forme de buffer
   * @param options Options personnalisées d'upload
   * @returns Promesse avec la réponse de l'upload
   */
  static async uploadImage(
    file: Express.Multer.File,
    name: string,
    options: UploadApiOptions = {}
  ): Promise<UploadApiResponse> {
    try {
      const defaultOptions: UploadApiOptions = {
        folder: 'uploads',
        resource_type: 'auto',
      };

      const mergedOptions = { ...defaultOptions, ...options };

      return await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { ...mergedOptions, public_id: name }, // Options pour Cloudinary
            (error, result) => {
              if (error) reject(error);
              else if (result) resolve(result);
              else reject(new Error('Upload failed'));
            }
          )
          .end(file.buffer);
      });
    } catch (error) {
      console.error("Erreur lors de l'upload Cloudinary :", error);
      throw error;
    }
  }

  static async deleteImage(publicId: string): Promise<any> {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image :", error);
      throw error;
    }
  }
}

export default CloudinaryService;
