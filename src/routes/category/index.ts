import Router from 'koa-router';
import { categoryController } from './controller.js';

const router = new Router();

// 获取分类列表
router.get('/category/list', async (ctx) => categoryController.getCategoryList(ctx));

// 获取分类信息
router.get('/category/:categoryId', async (ctx) => categoryController.getCategoryInfo(ctx));

// 创建分类
router.post('/category', async (ctx) => categoryController.createCategory(ctx));

// 修改分类
router.put('/category/:categoryId', async (ctx) => categoryController.updateCategory(ctx));
router.put('/category', async (ctx) => categoryController.updateCategory(ctx));

// 删除分类
router.delete('/category/:categoryId', async (ctx) => categoryController.deleteCategory(ctx));

export { router as categoryRouter };
