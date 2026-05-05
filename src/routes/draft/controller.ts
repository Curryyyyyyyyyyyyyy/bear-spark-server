import { draftService } from './service.js';
import { success } from '../../utils/helper.js';
import { requireAuth } from '../../middleware/auth.js';

export class DraftController {
  async saveDraft(ctx: any) {
    const user = requireAuth(ctx);
    const data = ctx.request.body as Record<string, unknown>;
    const result = await draftService.saveDraft(user.userId, data as any);
    ctx.body = success(result);
  }

  async getDraftInfo(ctx: any) {
    const user = requireAuth(ctx);
    const { draftId } = ctx.params;
    const result = await draftService.getDraftInfo(Number(draftId), user.userId);
    ctx.body = success(result);
  }

  async deleteDraft(ctx: any) {
    const user = requireAuth(ctx);
    const { draftId } = ctx.params;
    const result = await draftService.deleteDraft(Number(draftId), user.userId);
    ctx.body = success(result);
  }

  async getDraftList(ctx: any) {
    const user = requireAuth(ctx);
    const { pageNum = 1, pageSize = 10 } = ctx.params;
    const result = await draftService.getDraftList(
      user.userId,
      Number(pageNum),
      Number(pageSize)
    );
    ctx.body = success(result);
  }
}

export const draftController = new DraftController();
