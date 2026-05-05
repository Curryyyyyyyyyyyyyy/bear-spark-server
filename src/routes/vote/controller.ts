import { voteService } from './service.js';
import { success } from '../../utils/helper.js';
import { requireAuth } from '../../middleware/auth.js';

export class VoteController {
  async getVoteDetail(ctx: any) {
    const { voteId } = ctx.query;
    const user = ctx.state.user;
    const result = await voteService.getVoteDetail(Number(voteId), user?.userId);
    ctx.body = success(result);
  }

  async vote(ctx: any) {
    const user = requireAuth(ctx);
    const { voteId, optionIds } = ctx.request.body as {
      voteId: number;
      optionIds: number[];
    };
    const result = await voteService.vote(user.userId, voteId, optionIds);
    ctx.body = success(result);
  }

  async createVote(ctx: any) {
    const user = requireAuth(ctx);
    const data = ctx.request.body as Record<string, unknown>;
    const result = await voteService.createVote(user.userId, data as any);
    ctx.body = success(result);
  }
}

export const voteController = new VoteController();
