import Router from 'koa-router';
import { newsController } from './controller.js';

const router = new Router();

// 获取发布准备信息
router.get('/happening/prepare', async (ctx) => newsController.getPrepareInfo(ctx));

// 分页获取动态列表
router.get('/happening', async (ctx) => newsController.getNewsList(ctx));

// 获取动态详情
router.get('/happening/detail', async (ctx) => newsController.getNewsDetail(ctx));

// 发布动态
router.post('/happening/publish', async (ctx) => newsController.publishNews(ctx));

// 修改动态
router.put('/happening', async (ctx) => newsController.updateNews(ctx));

// 删除动态
router.delete('/happening', async (ctx) => newsController.deleteNews(ctx));

// 转发动态
router.post('/forward/happening', async (ctx) => newsController.forwardNews(ctx));

// 点赞动态
router.post('/like/happening', async (ctx) => newsController.likeNews(ctx));

// 取消点赞
router.delete('/like/happening', async (ctx) => newsController.unlikeNews(ctx));

// 获取点赞用户列表
router.get('/happening/list/liked', async (ctx) => newsController.getLikeList(ctx));

// 获取转发用户列表
router.get('/happening/list/forwarded', async (ctx) => newsController.getForwardList(ctx));

export { router as newsRouter };
