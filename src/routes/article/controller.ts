import { articleService } from './service.js';
import { success } from '../../utils/helper.js';
import { requireAuth } from '../../middleware/auth.js';

export class ArticleController {
  async publishArticle(ctx: any) {
    const user = requireAuth(ctx);
    const data = ctx.request.body as Record<string, unknown>;
    const result = await articleService.publishArticle(user.userId, data as any);
    ctx.body = success(result);
  }

  async getArticleInfo(ctx: any) {
    const { articleId } = ctx.params;
    const result = await articleService.getArticleInfo(Number(articleId));
    ctx.body = success(result);
  }

  async getArticleDetail(ctx: any) {
    const { articleId } = ctx.params;
    const user = ctx.state.user;
    const result = await articleService.getArticleDetail(
      Number(articleId),
      user?.userId
    );
    ctx.body = success(result);
  }

  async getArticleList(ctx: any) {
    const {
      pageNum = ctx.params.pageNum ?? 1,
      pageSize = ctx.params.pageSize ?? 10,
      categoryId,
      listedUserId,
    } = ctx.query;
    const result = await articleService.getArticleList({
      pageNum: Number(pageNum),
      pageSize: Number(pageSize),
      ...(categoryId !== undefined && categoryId !== '' && { categoryId: Number(categoryId) }),
      ...(listedUserId !== undefined && listedUserId !== '' && { listedUserId: Number(listedUserId) }),
    });
    ctx.body = success(result);
  }

  async updateArticle(ctx: any) {
    const user = requireAuth(ctx);
    const data = ctx.request.body as Record<string, unknown>;
    const result = await articleService.updateArticle(
      data.articleId as number,
      user.userId,
      data as any
    );
    ctx.body = success(result);
  }

  async deleteArticle(ctx: any) {
    const user = requireAuth(ctx);
    const { articleId } = ctx.params;
    const result = await articleService.deleteArticle(Number(articleId), user.userId);
    ctx.body = success(result);
  }

  async collectArticle(ctx: any) {
    const user = requireAuth(ctx);
    const { articleId, collected } = ctx.params;
    const result = await articleService.collectArticle(
      user.userId,
      Number(articleId),
      collected === '1'
    );
    ctx.body = success(result);
  }

  async giveMerit(ctx: any) {
    const user = requireAuth(ctx);
    const { articleId } = ctx.params;
    const result = await articleService.giveMerit(user.userId, Number(articleId));
    ctx.body = success(result);
  }
}

export const articleController = new ArticleController();
