import SwaggerRouter from '../swagger-builder/SwaggerRouter';
import authRoutes from './authRoutes';
import PetsitterRoutes from './PetsitterRoute';
import UserRoutes from './UserRoute';
import PetSitterRatingRoute from './PetSitterRatingRoute';

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
  {
    path: '/User',
    route: UserRoutes,
  },
  {
    path: '/petSitterRating',
    route: PetSitterRatingRoute,
  },
];

routes.forEach((r) => {
  defaultRouter.use(r.path, r.route);
});

export default defaultRouter;
