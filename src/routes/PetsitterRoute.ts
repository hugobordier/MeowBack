
import PetsitterController  from "../controllers/PetsitterController";
import SwaggerRouter from "../swagger-builder/SwaggerRouter";
import { authenticate } from "../middleware/authMiddleware";

const swaggerRouter = new SwaggerRouter();

swaggerRouter.route("/")
  .get(
    {
      description: "Fetch data for Petsitter",
      summary: "Retrieve Petsitter data",
      security: false,
      responses: {
        "200": {
          description: "Petsitter data retrieved successfully",
          schema: {
            type: "object",
            properties: {
              message: { type: "string", example: "Données récupérées avec succès" },
            },
          },
        },
        "400": { description: "Bad request" },
      },
    },
    PetsitterController.getData,
    authenticate, 
  );

export default swaggerRouter;
    
