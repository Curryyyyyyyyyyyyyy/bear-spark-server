import Router from 'koa-router';
import { articleController } from './controller.js';

const router = new Router();

// 发布文章
router.post('/article', async (ctx) => articleController.publishArticle(ctx));

// 获取文章信息
router.get('/article/:articleId', async (ctx) => articleController.getArticleInfo(ctx));

// 获取文章详情
router.get('/article/detail/:articleId', async (ctx) => articleController.getArticleDetail(ctx));

// 分页获取文章列表
router.get('/article/:pageNum/:pageSize', async (ctx) => articleController.getArticleList(ctx));

// 修改文章
router.put('/article', async (ctx) => articleController.updateArticle(ctx));

// 删除文章
router.delete('/article/:articleId', async (ctx) => articleController.deleteArticle(ctx));

// 收藏文章
router.post('/collect/article/:articleId/:collected', async (ctx) => articleController.collectArticle(ctx));

// 打赏文章
router.post('/merit/article/:articleId', async (ctx) => articleController.giveMerit(ctx));

export { router as articleRouter };
