import SwaggerRouter from '../swagger-builder/SwaggerRouter';
import authRoutes from './authRoutes';
import PetsitterRoutes from './PetsitterRoute';
import UserRoutes from './UserRoute';
import PetRoutes from './PetRoutes';
import PetSitterRatingRoute from './PetSitterRatingRoute';
import PetSitterReviewRoute from './PetSitterReviewRoute';
import PetImageRoutes from './PetImageRoutes';
import UserAmisRoute from './UserAmisRoute';
import NotificationTokenRoutes from './NotificationTokenRoutes';

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
  {path:'/PetsRoutes',
    route: PetRoutes,
  },
  {
    path: '/petSitterRating',
    route: PetSitterRatingRoute,
  },
  {
    path: '/petSitterReview',
    route: PetSitterReviewRoute,
  },
  {
    path: '/PetImage',
    route: PetImageRoutes,
  },
  {
    path: '/Amis',
    route: UserAmisRoute,
  },
  {
    path: '/NotificationToken',
    route: NotificationTokenRoutes,
  },
];

routes.forEach((r) => {
  defaultRouter.use(r.path, r.route);
});

export default defaultRouter;
