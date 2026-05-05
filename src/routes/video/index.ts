import Router from 'koa-router';
import { videoController } from './controller.js';

const router = new Router();

// 发布视频
router.post('/video', async (ctx) => videoController.publishVideo(ctx));

// 获取视频列表
router.get('/video/list/:pageNum/:pageSize', async (ctx) => videoController.getVideoList(ctx));
router.get('/video/list', async (ctx) => videoController.getVideoList(ctx));

// 获取视频详情
router.get('/video/play/:id', async (ctx) => videoController.getVideoDetail(ctx));
router.get('/video/:id', async (ctx) => videoController.getVideoDetail(ctx));

// 修改视频
router.put('/video', async (ctx) => videoController.updateVideo(ctx));

// 删除视频
router.delete('/video/:id', async (ctx) => videoController.deleteVideo(ctx));

export { router as videoRouter };
