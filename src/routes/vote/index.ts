import Router from 'koa-router';
import { voteController } from './controller.js';

const router = new Router();

// 获取投票详情
router.get('/vote/detail', async (ctx) => voteController.getVoteDetail(ctx));

// 投票
router.post('/vote/vote', async (ctx) => voteController.vote(ctx));

// 创建投票
router.post('/vote', async (ctx) => voteController.createVote(ctx));

export { router as voteRouter };
