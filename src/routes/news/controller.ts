import { newsService } from './service.js';
import { success } from '../../utils/helper.js';
import { requireAuth } from '../../middleware/auth.js';

export class NewsController {
  async getPrepareInfo(ctx: any) {
    const user = ctx.state.user;
    const result = await newsService.getPrepareInfo(user?.userId);
    ctx.body = success(result);
  }

  async publishNews(ctx: any) {
    const user = requireAuth(ctx);
    const data = ctx.request.body as Record<string, unknown>;
    const result = await newsService.publishNews(user.userId, data as any);
    ctx.body = success(result);
  }

  async getNewsList(ctx: any) {
    const { page = 1, pageNum, pageSize = 10, userId, tag } = ctx.query;
    const result = await newsService.getNewsList({
      page: Number(pageNum ?? page),
      pageSize: Number(pageSize),
      ...(userId !== undefined && userId !== '' && { userId: Number(userId) }),
      tag: tag as string,
    });
    ctx.body = success(result);
  }

  async getNewsDetail(ctx: any) {
    const { happeningId } = ctx.query;
    const user = ctx.state.user;
    const result = await newsService.getNewsDetail(
      Number(happeningId),
      user?.userId
    );
    ctx.body = success(result);
  }

  async updateNews(ctx: any) {
    const user = requireAuth(ctx);
    const { happeningId } = ctx.query;
    const data = ctx.request.body as Record<string, unknown>;
    const result = await newsService.updateNews(
      Number(happeningId),
      user.userId,
      data as any
    );
    ctx.body = success(result);
  }

  async deleteNews(ctx: any) {
    const user = requireAuth(ctx);
    const { happeningId } = ctx.query;
    const result = await newsService.deleteNews(Number(happeningId), user.userId);
    ctx.body = success(result);
  }

  async forwardNews(ctx: any) {
    const user = requireAuth(ctx);
    const { happeningId, content } = ctx.request.body as {
      happeningId: number;
      content?: string;
    };
    const result = await newsService.forwardNews(user.userId, happeningId, content);
    ctx.body = success(result);
  }

  async likeNews(ctx: any) {
    const user = requireAuth(ctx);
    const { happeningId, liked } = ctx.request.body as { happeningId: number; liked?: number };
    const result = liked === 0
      ? await newsService.unlikeNews(user.userId, Number(happeningId))
      : await newsService.likeNews(user.userId, Number(happeningId));
    ctx.body = success(result);
  }

  async unlikeNews(ctx: any) {
    const user = requireAuth(ctx);
    const { happeningId } = ctx.request.body as { happeningId: number };
    const result = await newsService.unlikeNews(user.userId, Number(happeningId));
    ctx.body = success(result);
  }

  async getLikeList(ctx: any) {
    const { happeningId, page = 1, pageNum, pageSize = 20 } = ctx.query;
    const result = await newsService.getLikeList(
      Number(happeningId),
      Number(pageNum ?? page),
      Number(pageSize)
    );
    ctx.body = success(result);
  }

  async getForwardList(ctx: any) {
    const { happeningId, page = 1, pageNum, pageSize = 20 } = ctx.query;
    const result = await newsService.getForwardList(
      Number(happeningId),
      Number(pageNum ?? page),
      Number(pageSize)
    );
    ctx.body = success(result);
  }
}

export const newsController = new NewsController();
