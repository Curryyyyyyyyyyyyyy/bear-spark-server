import { AppDataSource } from '../../database/connection.js';
import { Draft } from '../../entity/index.js';
import { NotFoundError } from '../../utils/helper.js';

export class DraftService {
  private draftRepo = AppDataSource.getRepository(Draft);

  async saveDraft(userId: number, data: Partial<Draft>) {
    const draft = this.draftRepo.create({
      ...data,
      userId,
      draftType: data.draftType || 'article',
    });
    await this.draftRepo.save(draft);
    return { draftId: draft.id };
  }

  async getDraftInfo(draftId: number, userId: number) {
    const draft = await this.draftRepo.findOne({
      where: { id: draftId, userId },
    });
    if (!draft) {
      throw new NotFoundError('草稿不存在');
    }
    return {
      draftId: draft.id,
      title: draft.title,
      content: draft.content,
      data: draft.data,
    };
  }

  async deleteDraft(draftId: number, userId: number) {
    const draft = await this.draftRepo.findOne({
      where: { id: draftId, userId },
    });
    if (!draft) {
      throw new NotFoundError('草稿不存在');
    }
    await this.draftRepo.remove(draft);
    return { message: '删除成功' };
  }

  async getDraftList(userId: number, pageNum = 1, pageSize = 10) {
    const [drafts, total] = await this.draftRepo.findAndCount({
      where: { userId },
      order: { updatedAt: 'DESC' },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });

    const records = drafts.map((d) => ({
      draftId: d.id,
      title: d.title,
      content: d.content,
      lastSaveTimeInfo: d.updatedAt.toISOString(),
    }));

    return { total, records };
  }
}

export const draftService = new DraftService();
