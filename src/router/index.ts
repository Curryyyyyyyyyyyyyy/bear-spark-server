import Router from 'koa-router';
import type Koa from 'koa';

import { authRouter } from '../routes/auth/index.js';
import { userRouter } from '../routes/user/index.js';
import { newsRouter } from '../routes/news/index.js';
import { articleRouter } from '../routes/article/index.js';
import { videoRouter } from '../routes/video/index.js';
import { commentRouter } from '../routes/comment/index.js';
import { categoryRouter } from '../routes/category/index.js';
import { draftRouter } from '../routes/draft/index.js';
import { voteRouter } from '../routes/vote/index.js';
import { tagRouter } from '../routes/tag/index.js';

export function registerRoutes(app: Koa) {
  const router = new Router();
  router.prefix('/bear-spark');

  // Health check endpoint
  router.get('/health', (ctx) => {
    ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Auth routes
  router.use(authRouter.routes(),authRouter.allowedMethods());

  // User routes
  router.use(userRouter.routes(), userRouter.allowedMethods());

  // News/Happening routes
  router.use(newsRouter.routes(), newsRouter.allowedMethods());

  // Article routes
  router.use(articleRouter.routes(), articleRouter.allowedMethods());

  // Video routes
  router.use(videoRouter.routes(), videoRouter.allowedMethods());

  // Comment routes
  router.use(commentRouter.routes(), commentRouter.allowedMethods());

  // Category routes
  router.use(categoryRouter.routes(), categoryRouter.allowedMethods());

  // Draft routes
  router.use(draftRouter.routes(), draftRouter.allowedMethods());

  // Vote routes
  router.use(voteRouter.routes(), voteRouter.allowedMethods());

  // Tag routes
  router.use(tagRouter.routes(), tagRouter.allowedMethods());

  app.use(router.routes());
  app.use(router.allowedMethods());
}
