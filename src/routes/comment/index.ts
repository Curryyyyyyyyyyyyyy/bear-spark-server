import Router from 'koa-router';
import { commentController } from './controller.js';

const router = new Router();

// 获取动态的楼评论
router.get('/comment/happening', async (ctx) => commentController.getBldgComment(ctx));

// 获取层评论
router.get('/comment/layer', async (ctx) => commentController.getLayerComment(ctx));

// 动态评论
router.post('/comment/happening', async (ctx) => commentController.commentHappening(ctx));

// 回复评论
router.post('/comment/reply', async (ctx) => commentController.replyComment(ctx));

// 删除评论
router.delete('/comment', async (ctx) => commentController.deleteComment(ctx));

// 点赞评论
router.post('/like/comment', async (ctx) => commentController.likeComment(ctx));

export { router as commentRouter };
