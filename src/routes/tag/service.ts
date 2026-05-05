import { AppDataSource } from '../../database/connection.js';
import { Tag } from '../../entity/index.js';

export class TagService {
  private tagRepo = AppDataSource.getRepository(Tag);

  async getTagList(page = 1, pageSize = 20) {
    const [tags, total] = await this.tagRepo.findAndCount({
      order: { useCount: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const records = tags.map((t) => ({
      tagId: t.id,
      content: t.name,
      viewNumInfo: t.useCount,
      discussNumInfo: t.useCount,
    }));

    return { total, records };
  }
}

export const tagService = new TagService();
