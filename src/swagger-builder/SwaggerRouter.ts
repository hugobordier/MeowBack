import express, {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from 'express';

interface RouteOptions {
  security?: boolean;
  description?: string;
  summary?: string;
  responses: {
    [statusCode: string]: {
      description: string;
      schema?: any;
    };
  };
  requestBody?: {
    description?: string;
    required?: boolean;
    schema?: any;
  };
}

export class SwaggerRouter {
  private router: Router;
  private swaggerSpec: any;

  constructor() {
    this.router = express.Router();
    this.swaggerSpec = {
      openapi: '3.0.0',
      info: {
        title: 'Swagger Router API',
        version: '1.0.0',
        description: 'API documentation generated dynamically',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local development server',
        },
        {
          url: 'https://meowback-production.up.railway.app',
          description: 'Production server',
        },
      ],
      paths: {},
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    };
  }

  route(path: string) {
    const self = this;
    return {
      post(
        options: RouteOptions,
        handler: (req: Request, res: Response) => void,
        ...middlewares: Array<
          (req: Request, res: Response, next: NextFunction) => void
        >
      ) {
        self.addSwaggerDoc('post', path, options);
        self.router.post(path, ...middlewares, handler!);
        return self;
      },
      get(
        options: RouteOptions,
        handler: (req: Request, res: Response) => void,
        ...middlewares: Array<
          (req: Request, res: Response, next: NextFunction) => void
        >
      ) {
        self.addSwaggerDoc('get', path, options);
        self.router.get(path, ...middlewares, handler);
        return self;
      },
      put(
        options: RouteOptions,
        handler: (req: Request, res: Response) => void,
        ...middlewares: Array<
          (req: Request, res: Response, next: NextFunction) => void
        >
      ) {
        self.addSwaggerDoc('put', path, options);
        self.router.put(path, ...middlewares, handler);
        return self;
      },
      delete(
        options: RouteOptions,
        handler: (req: Request, res: Response) => void,
        ...middlewares: Array<
          (req: Request, res: Response, next: NextFunction) => void
        >
      ) {
        self.addSwaggerDoc('delete', path, options);
        self.router.delete(path, ...middlewares, handler);
        return self;
      },
      patch(
        options: RouteOptions,
        handler: (req: Request, res: Response) => void,
        ...middlewares: Array<
          (req: Request, res: Response, next: NextFunction) => void
        >
      ) {
        self.addSwaggerDoc('patch', path, options);
        self.router.patch(path, ...middlewares, handler);
        return self;
      },
    };
  }

  private addSwaggerDoc(method: string, path: string, options: RouteOptions) {
    if (!this.swaggerSpec.paths[path]) {
      this.swaggerSpec.paths[path] = {};
    }

    this.swaggerSpec.paths[path][method] = {
      summary: options.summary,
      description: options.description,
      responses: Object.fromEntries(
        Object.entries(options.responses).map(([status, details]) => [
          status,
          {
            description: details.description,
            ...(details.schema
              ? { content: { 'application/json': { schema: details.schema } } }
              : {}),
          },
        ])
      ),
      ...(options.requestBody
        ? {
            requestBody: {
              required: options.requestBody.required || false,
              content: {
                'application/json': {
                  schema: options.requestBody.schema,
                },
              },
            },
          }
        : {}),
      ...(options.security
        ? {
            security: [{ BearerAuth: [] }],
          }
        : {}),
    };
  }

  use(path: string, router: SwaggerRouter) {
    this.router.use(path, router.getRouter());

    const subSpec = router.getSwaggerSpec().paths;
    for (const route in subSpec) {
      this.swaggerSpec.paths[`${path}${route}`] = subSpec[route];
    }
  }

  getRouter() {
    return this.router;
  }

  getSwaggerSpec() {
    return this.swaggerSpec;
  }
}

export default SwaggerRouter;
