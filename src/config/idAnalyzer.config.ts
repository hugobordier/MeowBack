//@ts-ignore
import IDAnalyzer from 'idanalyzer';
import type User from '@/models/User';
import dotenv from 'dotenv';
import { Buffer } from 'buffer';
import { Readable } from 'stream';

dotenv.config();

interface UserVerificationData {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
}

interface IDVerificationResult {
  isAuthentic: boolean;
  isNameMatch: boolean;
  isAgeVerified: boolean;
  croppedDocument?: Express.Multer.File;
  authenticationScore?: number;
  confidenceScore?: number;
  errors?: string[];
}

class IDVerificationService {
  private static async convertToBase64(
    image: File | Express.Multer.File
  ): Promise<string> {
    // If it's an Express.Multer.File, use its buffer
    if ('buffer' in image) {
      return `data:image/jpeg;base64,${image.buffer.toString('base64')}`;
    }

    // For standard File, read as buffer
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${image.type};base64,${buffer.toString('base64')}`;
  }

  // Helper method to safely parse and compare dates
  private static safeParseDateComparison(
    documentDate: string | Date,
    userDate: string | Date | undefined
  ): boolean {
    // If no user date is provided, skip age verification
    if (!userDate) return false;

    try {
      // Ensure both dates are Date objects
      const docDate =
        documentDate instanceof Date ? documentDate : new Date(documentDate);

      const userData = userDate instanceof Date ? userDate : new Date(userDate);

      // Compare year, month, and day
      return (
        docDate.getFullYear() === userData.getFullYear() &&
        docDate.getMonth() === userData.getMonth() &&
        docDate.getDate() === userData.getDate()
      );
    } catch (error) {
      console.error('Date comparison error:', error);
      return false;
    }
  }

  static async verifyID(
    documentImage: File | Express.Multer.File,
    userData: User,
    biometricPhoto?: File | Express.Multer.File
  ): Promise<IDVerificationResult> {
    try {
      const coreAPI = new IDAnalyzer.CoreAPI(
        process.env.ID_ANALYZER_API_KEY as string,
        'EU'
      );

      coreAPI.enableAuthentication(true, 2);

      // Convert document image to base64
      const documentBase64 = await this.convertToBase64(documentImage);

      const scanOptions: any = {
        document_primary: documentBase64,
      };

      // Add biometric photo if provided
      if (biometricPhoto) {
        scanOptions.biometric_photo =
          await this.convertToBase64(biometricPhoto);
      }

      const response = await coreAPI.scan(scanOptions);

      console.log(response);

      // Initialize verification result
      const verificationResult: IDVerificationResult = {
        isAuthentic: false,
        isNameMatch: false,
        isAgeVerified: false,
        errors: [],
      };

      // Check for API errors
      if (response.error) {
        verificationResult.errors?.push(response.error);
        return verificationResult;
      }

      // Extract results
      const dataResult = response['result'] || {};
      const authenticationResult = response['authentication'] || {};
      const faceResult = response['face'] || {};

      // Verify document authenticity
      if (authenticationResult.score) {
        verificationResult.authenticationScore = authenticationResult.score;
        verificationResult.isAuthentic = authenticationResult.score > 0.5;
      }

      // Verify name
      if (dataResult.firstName && dataResult.lastName) {
        verificationResult.isNameMatch =
          dataResult.firstName.toLowerCase() ===
            userData.firstName.toLowerCase() &&
          dataResult.lastName.toLowerCase() === userData.lastName.toLowerCase();
      }

      // Verify age (if date of birth is provided)
      if (dataResult.dob) {
        verificationResult.isAgeVerified = this.safeParseDateComparison(
          dataResult.dob,
          userData.birthDate
        );
      }

      // Biometric verification (if photo was provided)
      if (biometricPhoto && faceResult.isIdentical !== undefined) {
        verificationResult.confidenceScore = faceResult.confidence;
      }

      // Récupérer l'image cadrée si disponible
      if (response.cropped_document) {
        const croppedBuffer = Buffer.from(
          response.cropped_document.replace(/^data:image\/\w+;base64,/, ''),
          'base64'
        );

        verificationResult.croppedDocument = {
          fieldname: 'croppedDocument',
          originalname: 'cropped_document.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          size: croppedBuffer.length,
          buffer: croppedBuffer,
          destination: '',
          filename: '',
          path: '',
          stream: Readable.from(croppedBuffer),
        } as Express.Multer.File;
      }

      return verificationResult;
    } catch (error) {
      return {
        isAuthentic: false,
        isNameMatch: false,
        isAgeVerified: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
}

export { IDVerificationService };
export type { UserVerificationData, IDVerificationResult };
