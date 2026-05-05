import { videoService } from './service.js';
import { success } from '../../utils/helper.js';
import { requireAuth } from '../../middleware/auth.js';

export class VideoController {
  async publishVideo(ctx: any) {
    const user = requireAuth(ctx);
    const data = ctx.request.body as Record<string, unknown>;
    const result = await videoService.publishVideo(user.userId, data as any);
    ctx.body = success(result);
  }

  async getVideoList(ctx: any) {
    const { page = 1, pageSize = 10, categoryId, userId } = ctx.query;
    const result = await videoService.getVideoList({
      page: Number(page),
      pageSize: Number(pageSize),
      ...(categoryId !== undefined && categoryId !== '' && { categoryId: Number(categoryId) }),
      ...(userId !== undefined && userId !== '' && { userId: Number(userId) }),
    });
    ctx.body = success(result);
  }

  async getVideoDetail(ctx: any) {
    const { id } = ctx.params;
    const user = ctx.state.user;
    const result = await videoService.getVideoDetail(Number(id), user?.userId);
    ctx.body = success(result);
  }

  async updateVideo(ctx: any) {
    const user = requireAuth(ctx);
    const data = ctx.request.body as Record<string, unknown>;
    const result = await videoService.updateVideo(
      data.id as number,
      user.userId,
      data as any
    );
    ctx.body = success(result);
  }

  async deleteVideo(ctx: any) {
    const user = requireAuth(ctx);
    const { id } = ctx.params;
    const result = await videoService.deleteVideo(Number(id), user.userId);
    ctx.body = success(result);
  }
}

export const videoController = new VideoController();
