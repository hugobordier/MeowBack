import fs from 'fs';
import path from 'path';

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('Erreur : veuillez fournir un nom de module !');
  process.exit(1);
}

const capitalizedModule =
  moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

// Définition des chemins
const routesDir = path.join(__dirname, 'routes');
const controllersDir = path.join(__dirname, 'controllers');
const servicesDir = path.join(__dirname, 'services');

// Vérification et création des dossiers si besoin
[routesDir, controllersDir, servicesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});

// **Fichier Service**
const serviceContent = `
export default class ${capitalizedModule}Service {
 

  static async getData() {
    try {
      return [];
    }
    catch (error) {
      throw error;
    }
  }
}
`;
fs.writeFileSync(
  path.join(servicesDir, `${capitalizedModule}Service.ts`),
  serviceContent
);

// **Fichier Controller**
const controllerContent = `
import { Request, Response } from "express";
import { ${capitalizedModule}Service } from "../services/${capitalizedModule}Service";

export default class ${capitalizedModule}Controller {
  

  
  static async getData(req: Request, res: Response) {
    try {
      const data = await ${capitalizedModule}Service.getData();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
  }
}
}
`;
fs.writeFileSync(
  path.join(controllersDir, `${capitalizedModule}Controller.ts`),
  controllerContent
);

// **Fichier Route**
const routeContent = `
import ${capitalizedModule}Controller  from "../controllers/${capitalizedModule}Controller";
import SwaggerRouter from "../swagger-builder/SwaggerRouter";
import { authenticate } from "../middleware/authMiddleware";

const swaggerRouter = new SwaggerRouter();

swaggerRouter.route("/")
  .get(
    {
      description: "Fetch data for ${capitalizedModule}",
      summary: "Retrieve ${capitalizedModule} data",
      security: false,
      responses: {
        "200": {
          description: "${capitalizedModule} data retrieved successfully",
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
    ${capitalizedModule}Controller.getData,
    authenticate, 
  );

export default swaggerRouter;
    
`;
fs.writeFileSync(
  path.join(routesDir, `${capitalizedModule}Route.ts`),
  routeContent
);

console.log(`Module ${capitalizedModule} créé avec succès ! 🚀`);
