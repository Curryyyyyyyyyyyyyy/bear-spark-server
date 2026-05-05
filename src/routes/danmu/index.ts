import Router from 'koa-router';
import { success } from '../../utils/helper.js';
import { requireAuth } from '../../middleware/auth.js';

type DanmuItem = Record<string, unknown> & {
  videoId: number;
  text?: string;
  time?: number;
};

const router = new Router();
const danmuStore = new Map<number, DanmuItem[]>();

router.post('/danmu/send', async (ctx) => {
  requireAuth(ctx as any);
  const body = ctx.request.body as DanmuItem;
  const videoId = Number(body.videoId);
  const item = {
    ...body,
    videoId,
    time: typeof body.time === 'number' ? body.time : 0,
  };
  const list = danmuStore.get(videoId) ?? [];

  list.push(item);
  danmuStore.set(videoId, list);
  ctx.body = success({ message: '发送成功' });
});

router.get('/danmu/list/:videoId', async (ctx) => {
  const videoId = Number(ctx.params.videoId);
  ctx.body = success(danmuStore.get(videoId) ?? []);
});

export { router as danmuRouter };
