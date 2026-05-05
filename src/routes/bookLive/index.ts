import Router from 'koa-router';
import { success } from '../../utils/helper.js';
import { requireAuth } from '../../middleware/auth.js';

const router = new Router();

router.post('/bookLive/cancel', async (ctx) => {
  requireAuth(ctx as any);
  const body = ctx.request.body as { bookLiveId?: number };

  ctx.body = success({
    bookLiveId: body.bookLiveId,
    canceled: 1,
  });
});

router.post('/bookLive/state', async (ctx) => {
  requireAuth(ctx as any);
  const body = ctx.request.body as { bookLiveId?: number; booked?: number; state?: number };
  const nextBooked = body.booked ?? body.state ?? 0;

  ctx.body = success({
    bookLiveId: body.bookLiveId,
    booked: nextBooked,
  });
});

export { router as bookLiveRouter };
