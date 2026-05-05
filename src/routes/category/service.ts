import { AppDataSource } from '../../database/connection.js';
import { Category } from '../../entity/index.js';
import { NotFoundError, ConflictError } from '../../utils/helper.js';

export class CategoryService {
  private categoryRepo = AppDataSource.getRepository(Category);

  private normalizeCategoryData(data: Partial<Category> & {
    categoryName?: string;
    categoryPhotoUrl?: string;
  }): Partial<Category> {
    const name = data.name ?? data.categoryName;
    const slug = data.slug ?? (name ? encodeURIComponent(name).slice(0, 50) : undefined);

    return {
      ...data,
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(data.categoryPhotoUrl !== undefined && { coverImage: data.categoryPhotoUrl }),
    };
  }

  async getCategoryList() {
    const categories = await this.categoryRepo.find({
      order: { sort: 'ASC', createdAt: 'DESC' },
    });

    return categories.map((c) => ({
      categoryId: c.id,
      categoryName: c.name,
      categoryPhotoUrl: c.coverImage,
      articleNum: c.articleCount,
      description: c.description,
    }));
  }

  async getCategoryInfo(categoryId: number) {
    const category = await this.categoryRepo.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    return {
      categoryId: category.id,
      categoryName: category.name,
      categoryPhotoUrl: category.coverImage,
      description: category.description,
    };
  }

  async createCategory(data: Partial<Category> & {
    categoryName?: string;
    categoryPhotoUrl?: string;
  }) {
    const normalizedData = this.normalizeCategoryData(data);
    const existCategory = normalizedData.name
      ? await this.categoryRepo.findOne({ where: { name: normalizedData.name } })
      : null;
    if (existCategory) {
      throw new ConflictError('分类名称已存在');
    }

    const category = this.categoryRepo.create(normalizedData);
    await this.categoryRepo.save(category);

    return {
      categoryId: category.id,
      categoryName: category.name,
    };
  }

  async updateCategory(categoryId: number, data: Partial<Category> & {
    categoryName?: string;
    categoryPhotoUrl?: string;
  }) {
    const category = await this.categoryRepo.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    Object.assign(category, this.normalizeCategoryData(data));
    await this.categoryRepo.save(category);

    return { message: '修改成功' };
  }

  async deleteCategory(categoryId: number) {
    const category = await this.categoryRepo.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    await this.categoryRepo.remove(category);
    return { message: '删除成功' };
  }
}

export const categoryService = new CategoryService();
