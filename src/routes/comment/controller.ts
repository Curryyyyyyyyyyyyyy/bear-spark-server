import { commentService } from './service.js';
import { success } from '../../utils/helper.js';
import { requireAuth } from '../../middleware/auth.js';

export class CommentController {
  async getBldgComment(ctx: any) {
    const { happeningId, page = 1, pageNum, pageSize = 20 } = ctx.query;
    const result = await commentService.getBldgComment(
      Number(happeningId),
      Number(pageNum ?? page),
      Number(pageSize)
    );
    ctx.body = success(result);
  }

  async getLayerComment(ctx: any) {
    const { parentId, commentId, page = 1, pageNum, pageSize = 20 } = ctx.query;
    const result = await commentService.getLayerComment(
      Number(parentId ?? commentId),
      Number(pageNum ?? page),
      Number(pageSize)
    );
    ctx.body = success(result);
  }

  async commentHappening(ctx: any) {
    const user = requireAuth(ctx);
    const data = ctx.request.body as Record<string, unknown>;
    const result = await commentService.commentHappening(user.userId, data as any);
    ctx.body = success(result);
  }

  async replyComment(ctx: any) {
    const user = requireAuth(ctx);
    const data = ctx.request.body as Record<string, unknown>;
    const result = await commentService.replyComment(user.userId, data as any);
    ctx.body = success(result);
  }

  async deleteComment(ctx: any) {
    const user = requireAuth(ctx);
    const { commentId } = ctx.query;
    const result = await commentService.deleteComment(Number(commentId), user.userId);
    ctx.body = success(result);
  }

  async likeComment(ctx: any) {
    const user = requireAuth(ctx);
    const { commentId } = ctx.request.body as { commentId: number };
    const result = await commentService.likeComment(user.userId, Number(commentId));
    ctx.body = success(result);
  }
}

export const commentController = new CommentController();
