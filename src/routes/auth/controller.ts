// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Ctx = any;
import { authService } from './service.js';
import { success } from '../../utils/helper.js';
import { requireAuth } from '../../middleware/auth.js';

export class AuthController {
  async login(ctx: Ctx) {
    const { phone, password } = ctx.request.body as {
      phone: string;
      password: string;
    };

    if (!phone || !password) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '手机号和密码不能为空', data: null };
      return;
    }

    const result = await authService.login(phone, password);
    ctx.body = success(result);
  }

  async register(ctx: Ctx) {
    const { phone, password } = ctx.request.body as {
      phone: string;
      password: string;
      nickname?: string;
    };

    if (!phone || !password) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '手机号和密码不能为空', data: null };
      return;
    }

    const result = await authService.register(phone, password);
    ctx.body = success(result);
  }

  async sendVerifyCode(ctx: Ctx) {
    const { phone } = ctx.request.body as { phone: string };

    if (!phone) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '手机号不能为空', data: null };
      return;
    }

    const result = await authService.sendVerifyCode(phone);
    ctx.body = success(result);
  }

  async verifyCode(ctx: Ctx) {
    const { phone, code } = ctx.request.body as { phone: string; code: string };

    if (!phone || !code) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '手机号和验证码不能为空', data: null };
      return;
    }

    const result = await authService.verifyCode(phone, code);
    ctx.body = success(result);
  }

  async changePassword(ctx: Ctx) {
    const { oldPassword, newPassword, phone, password, code } = ctx.request.body as {
      oldPassword?: string;
      newPassword?: string;
      phone?: string;
      password?: string;
      code?: string;
    };

    if (phone && password && code) {
      const result = await authService.resetPassword(phone, password, code);
      ctx.body = success(result);
      return;
    }

    const user = requireAuth(ctx);

    if (!oldPassword || !newPassword) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '原密码和新密码不能为空', data: null };
      return;
    }

    const result = await authService.changePassword(user.userId, oldPassword, newPassword);
    ctx.body = success(result);
  }

  async logout(ctx: Ctx) {
    // JWT 无状态，客户端删除 token 即可
    ctx.body = success({ message: '登出成功' });
  }
}

export const authController = new AuthController();
