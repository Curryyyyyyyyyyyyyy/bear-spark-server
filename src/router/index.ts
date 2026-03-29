import Router from 'koa-router';
import type { Koa } from 'koa';

export function registerRoutes(app: Koa) {
  const router = new Router();

  // Health check endpoint
  router.get('/health', (ctx) => {
    ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Import route modules here
  // import { userRouter } from '../routes/user.js';
  // router.use('/users', userRouter.routes());

  app.use(router.routes());
  app.use(router.allowedMethods());
}
