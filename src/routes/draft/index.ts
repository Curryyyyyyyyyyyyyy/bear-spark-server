import Router from 'koa-router';
import { draftController } from './controller.js';

const router = new Router();

// 保存草稿
router.post('/draft', async (ctx) => draftController.saveDraft(ctx));

// 获取草稿详情
router.get('/draft/:draftId', async (ctx) => draftController.getDraftInfo(ctx));

// 删除草稿
router.delete('/draft/:draftId', async (ctx) => draftController.deleteDraft(ctx));

// 获取草稿列表
router.get('/draft/:pageNum/:pageSize', async (ctx) => draftController.getDraftList(ctx));

export { router as draftRouter };
