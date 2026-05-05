import Router from 'koa-router';
import { userController } from './controller.js';

const router = new Router();

// 获取当前用户信息
router.get('/info/user', async (ctx) => userController.getUserInfo(ctx));

// 获取指定用户信息
router.get('/user/:id', async (ctx) => userController.getUserInfoById(ctx));

// 更新用户信息（需认证）
router.put('/user/:id', async (ctx) => userController.updateUserInfo(ctx));

// 获取粉丝列表
router.get('/user/:id/followers', async (ctx) => userController.getFollowerList(ctx));

// 获取关注列表
router.get('/user/:id/following', async (ctx) => userController.getFollowingList(ctx));

// 关注用户（需认证）
router.post('/user/:id/follow', async (ctx) => userController.follow(ctx));

// 取消关注（需认证）
router.delete('/user/:id/follow', async (ctx) => userController.unfollow(ctx));

export { router as userRouter };
