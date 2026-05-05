import Router from 'koa-router';
import { tagController } from './controller.js';

const router = new Router();

// 获取标签列表
router.get('/tag', async (ctx) => tagController.getTagList(ctx));

export { router as tagRouter };
