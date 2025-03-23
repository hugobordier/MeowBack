import SwaggerRouter from '../swagger-builder/SwaggerRouter';
import authRoutes from './authRoutes';
import PetsitterRoutes from './PetsitterRoute';
import PetRoutes from './PetRoutes';

export interface IRoute {
  path: string;
  route: SwaggerRouter;
}

const defaultRouter = new SwaggerRouter();

const routes: IRoute[] = [
  {
    path: '/authRoutes',
    route: authRoutes,
  },
  {
    path: '/PetsitterRoutes',
    route: PetsitterRoutes,
  },
  {path:'/PetsRoutes',
    route: PetRoutes,
  }
];

routes.forEach((r) => {
  defaultRouter.use(r.path, r.route);
});

export default defaultRouter;
