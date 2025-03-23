import SwaggerRouter from '../swagger-builder/SwaggerRouter';
import authRoutes from './authRoutes';
import PetsitterRoutes from './PetsitterRoute';
<<<<<<< HEAD
import UserRoutes from './UserRoute';
=======
import PetRoutes from './PetRoutes';
>>>>>>> ad3dd95 (CRUD pet marche db locale mais pas encore db en ligne)

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
    path: '/Petsitter',
    route: PetsitterRoutes,
  },
<<<<<<< HEAD
  {
    path: '/User',
    route: UserRoutes,
  },
=======
  {path:'/PetsRoutes',
    route: PetRoutes,
  }
>>>>>>> ad3dd95 (CRUD pet marche db locale mais pas encore db en ligne)
];

routes.forEach((r) => {
  defaultRouter.use(r.path, r.route);
});

export default defaultRouter;
