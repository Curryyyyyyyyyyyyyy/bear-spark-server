import { tagService } from './service.js';
import { success } from '../../utils/helper.js';

export class TagController {
  async getTagList(ctx: any) {
    const { page = 1, pageNum, pageSize = 20 } = ctx.query;
    const result = await tagService.getTagList(Number(pageNum ?? page), Number(pageSize));
    ctx.body = success(result);
  }
}

export const tagController = new TagController();
