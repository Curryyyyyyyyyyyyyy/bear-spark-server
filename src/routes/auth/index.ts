import Router from 'koa-router';
import { authController } from './controller.js';

const router = new Router();

// 登录
router.post('/user/login', async (ctx) => authController.login(ctx));

// 注册
router.post('/user/password', async (ctx) => authController.register(ctx));

// 发送验证码
router.post('/user/send', async (ctx) => authController.sendVerifyCode(ctx));

// 验证验证码
router.post('/user/verify', async (ctx) => authController.verifyCode(ctx));

// 修改密码（需认证）
router.put('/user/password', async (ctx) => authController.changePassword(ctx));

// 登出
router.post('/user/logout', async (ctx) => authController.logout(ctx));

export { router as authRouter };
