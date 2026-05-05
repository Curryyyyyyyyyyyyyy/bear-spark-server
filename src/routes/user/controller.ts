import { userService } from './service.js';
import { success } from '../../utils/helper.js';
import { requireAuth } from '../../middleware/auth.js';

export class UserController {
  async getUserInfo(ctx: any) {
    // 如果已登录，返回当前用户信息；否则返回公共信息
    const user = ctx.state.user;
    const userId = user ? user.userId : 1; // 默认为 1，实际应根据需求调整

    const result = await userService.getUserInfo(userId);
    ctx.body = success(result);
  }

  async getUserInfoById(ctx: any) {
    const { id } = ctx.params;
    const result = await userService.getUserInfo(Number(id));
    ctx.body = success(result);
  }

  async updateUserInfo(ctx: any) {
    const user = requireAuth(ctx);
    const data = ctx.request.body as Record<string, unknown>;
    const result = await userService.updateUserInfo(user.userId, data as any);
    ctx.body = success(result);
  }

  async getFollowerList(ctx: any) {
    const userId = ctx.params.id ?? ctx.query.userId;
    const { page = 1, pageNum, pageSize = 20 } = ctx.query;
    const result = await userService.getFollowerList(
      Number(userId),
      Number(pageNum ?? page),
      Number(pageSize)
    );
    ctx.body = success(result);
  }

  async getCurrentFollowerList(ctx: any) {
    const userId = ctx.state.user?.userId ?? 1;
    const result = await userService.getFollowerList(Number(userId), 1, 20);
    ctx.body = success({ followerList: result.records });
  }

  async getFollowingList(ctx: any) {
    const userId = ctx.params.id ?? ctx.query.userId;
    const { page = 1, pageNum, pageSize = 20 } = ctx.query;
    const result = await userService.getFollowingList(
      Number(userId),
      Number(pageNum ?? page),
      Number(pageSize)
    );
    ctx.body = success(result);
  }

  async follow(ctx: any) {
    const user = requireAuth(ctx);
    const { id } = ctx.params;
    const result = await userService.follow(user.userId, Number(id));
    ctx.body = success(result);
  }

  async unfollow(ctx: any) {
    const user = requireAuth(ctx);
    const { id } = ctx.params;
    const result = await userService.unfollow(user.userId, Number(id));
    ctx.body = success(result);
  }
}

export const userController = new UserController();
