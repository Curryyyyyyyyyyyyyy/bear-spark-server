import { categoryService } from './service.js';
import { success } from '../../utils/helper.js';
import { requireAuth } from '../../middleware/auth.js';

export class CategoryController {
  async getCategoryList(ctx: any) {
    const result = await categoryService.getCategoryList();
    ctx.body = success(result);
  }

  async getCategoryInfo(ctx: any) {
    const { categoryId } = ctx.params;
    const result = await categoryService.getCategoryInfo(Number(categoryId));
    ctx.body = success(result);
  }

  async createCategory(ctx: any) {
    requireAuth(ctx);
    const data = ctx.request.body as Record<string, unknown>;
    const result = await categoryService.createCategory(data as any);
    ctx.body = success(result);
  }

  async updateCategory(ctx: any) {
    requireAuth(ctx);
    const { categoryId } = ctx.params;
    const data = ctx.request.body as Record<string, unknown>;
    const result = await categoryService.updateCategory(Number(categoryId), data as any);
    ctx.body = success(result);
  }

  async deleteCategory(ctx: any) {
    requireAuth(ctx);
    const { categoryId } = ctx.params;
    const result = await categoryService.deleteCategory(Number(categoryId));
    ctx.body = success(result);
  }
}

export const categoryController = new CategoryController();
