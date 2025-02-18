import SwaggerRouter from '../swagger-builder/SwaggerRouter';
import authRoutes from './authRoutes';

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
];

routes.forEach((r) => {
  defaultRouter.use(r.path, r.route);
});

export default defaultRouter;
