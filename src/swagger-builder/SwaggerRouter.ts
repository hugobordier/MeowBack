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
  tags?: string[];
  parameters?: {
    name: string;
    in: 'path' | 'query' | 'header' | 'cookie';
    description?: string;
    required?: boolean;
    schema?: any;
    example?: any;
  }[];
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
    contentType?:
      | 'application/json'
      | 'multipart/form-data'
      | 'application/xml'
      | string;
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
        {
          url: 'http://46.255.164.67:3000',
          description: 'Amin server',
        },
        {
          url: 'http://v71168.webmo.fr/MeowBack',
          description: 'Amin server avec le nom de domaine',
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
    const pathParams = this.extractPathParams(path);

    return {
      post(
        options: RouteOptions,
        handler: (req: Request, res: Response) => void,
        ...middlewares: Array<
          (req: Request, res: Response, next: NextFunction) => void
        >
      ) {
        self.addSwaggerDoc('post', path, options, pathParams);
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
        self.addSwaggerDoc('get', path, options, pathParams);
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
        self.addSwaggerDoc('put', path, options, pathParams);
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
        self.addSwaggerDoc('delete', path, options, pathParams);
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
        self.addSwaggerDoc('patch', path, options, pathParams);
        self.router.patch(path, ...middlewares, handler);
        return self;
      },
    };
  }

  private extractPathParams(
    path: string
  ): { name: string; required: boolean }[] {
    const params: { name: string; required: boolean }[] = [];
    const segments = path.split('/');

    for (const segment of segments) {
      if (segment.startsWith(':')) {
        const paramName = segment.substring(1);
        params.push({
          name: paramName,
          required: true,
        });
      }
    }

    return params;
  }

  private addSwaggerDoc(
    method: string,
    path: string,
    options: RouteOptions,
    pathParams: { name: string; required: boolean }[]
  ) {
    const swaggerPath = path.replace(/\:([^\/]+)/g, '{$1}');

    if (!this.swaggerSpec.paths[swaggerPath]) {
      this.swaggerSpec.paths[swaggerPath] = {};
    }

    const mergedParams = [...(options.parameters || [])];

    for (const param of pathParams) {
      if (!mergedParams.some((p) => p.name === param.name && p.in === 'path')) {
        mergedParams.push({
          name: param.name,
          in: 'path',
          required: param.required,
          description: `${param.name} parameter`,
          schema: {
            type: 'string',
          },
        });
      }
    }

    const contentType = options.requestBody?.contentType || 'application/json';

    this.swaggerSpec.paths[swaggerPath][method] = {
      summary: options.summary,
      description: options.description,
      tags: options.tags,
      parameters: mergedParams.length > 0 ? mergedParams : undefined,
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
                [contentType]: {
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
      const basePath = path.endsWith('/') ? path.slice(0, -1) : path;
      const subPath = route.startsWith('/') ? route : `/${route}`;
      this.swaggerSpec.paths[`${basePath}${subPath}`] = subSpec[route];
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
