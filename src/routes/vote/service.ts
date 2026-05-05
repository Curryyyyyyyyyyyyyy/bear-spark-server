import { AppDataSource } from '../../database/connection.js';
import { Vote, VoteOption, VoteRecord, News, User } from '../../entity/index.js';
import { NotFoundError, BadRequestError } from '../../utils/helper.js';
import { formatDisplayTime } from '../../utils/time.js';

export class VoteService {
  private voteRepo = AppDataSource.getRepository(Vote);
  private voteOptionRepo = AppDataSource.getRepository(VoteOption);
  private voteRecordRepo = AppDataSource.getRepository(VoteRecord);
  private newsRepo = AppDataSource.getRepository(News);
  private userRepo = AppDataSource.getRepository(User);

  private normalizeDeadline(deadline?: number | string | Date): Date | undefined {
    if (deadline === undefined || deadline === null || deadline === 0 || deadline === '') {
      return undefined;
    }

    if (deadline instanceof Date) {
      return Number.isNaN(deadline.getTime()) ? undefined : deadline;
    }

    const parsed = typeof deadline === 'number' ? new Date(deadline) : new Date(deadline);

    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  async getVoteDetail(voteId: number, userId?: number) {
    const vote = await this.voteRepo.findOne({
      where: { id: voteId },
      relations: ['options'],
    });

    if (!vote) {
      throw new NotFoundError('投票不存在');
    }

    const author = await this.userRepo.findOne({ where: { id: vote.authorId } });

    // 计算每个选项的百分比
    const total = vote.options.reduce((sum, opt) => sum + opt.voteCount, 0);
    const optionList = vote.options.map((opt) => ({
      optionId: opt.id,
      optionContent: opt.optionContent,
      optionPhotoUrl: opt.optionPhotoUrl,
      optionPercent: total > 0 ? ((opt.voteCount / total) * 100).toFixed(1) : '0',
      selected: 0,
    }));

    // 检查用户是否已投票
    let voted = false;
    let voterInfoList: { username: string; avatarUrl: string; optionsInfo: string }[] = [];

    if (userId) {
      const records = await this.voteRecordRepo.find({
        where: { voteId, userId },
        relations: ['option'],
      });
      voted = records.length > 0;

      if (voted) {
        records.forEach((r) => {
          optionList.find((o) => o.optionId === r.optionId)!.selected = 1;
        });
      }

      // 获取投票者信息
      const allRecords = await this.voteRecordRepo.find({
        where: { voteId },
        relations: ['user', 'option'],
        take: 10,
      });
      voterInfoList = allRecords.map((r) => ({
        username: r.user.nickname || r.user.phone,
        avatarUrl: r.user.avatar || '',
        optionsInfo: r.option.optionContent,
      }));
    }

    return {
      publisherInfo: {
        userId: vote.authorId,
        username: author?.nickname || author?.phone || '',
        avatarUrl: author?.avatar || '',
      },
      title: vote.title,
      desc: vote.description || '',
      voteNumInfo: String(vote.totalCount),
      deadlineInfo: vote.deadline ? `${formatDisplayTime(vote.deadline)} 截止` : '长期有效',
      voteType: vote.voteType,
      optionList,
      voteLim: vote.voteLimit,
      dead: vote.deadline && new Date(vote.deadline) < new Date() ? 1 : 0,
      voted: voted ? 1 : 0,
      voterInfoList,
    };
  }

  async vote(userId: number, voteId: number, optionIds: number[]) {
    const vote = await this.voteRepo.findOne({
      where: { id: voteId },
      relations: ['options'],
    });

    if (!vote) {
      throw new NotFoundError('投票不存在');
    }

    // 检查是否已过期
    if (vote.deadline && new Date(vote.deadline) < new Date()) {
      throw new BadRequestError('投票已过期');
    }

    // 检查投票限制
    const existingVotes = await this.voteRecordRepo.count({ where: { voteId, userId } });
    if (existingVotes + optionIds.length > vote.voteLimit) {
      throw new BadRequestError(`最多只能投 ${vote.voteLimit} 票`);
    }

    // 验证选项是否属于该投票
    const validOptionIds = vote.options.map((o) => o.id);
    for (const optionId of optionIds) {
      if (!validOptionIds.includes(optionId)) {
        throw new BadRequestError('无效的选项');
      }
    }

    // 记录投票
    for (const optionId of optionIds) {
      const record = this.voteRecordRepo.create({ userId, voteId, optionId });
      await this.voteRecordRepo.save(record);
      await this.voteOptionRepo.increment({ id: optionId }, 'voteCount', 1);
    }

    // 更新投票总数
    await this.voteRepo.increment({ id: voteId }, 'totalCount', optionIds.length);

    return { message: '投票成功' };
  }

  async createVote(authorId: number, data: {
    title: string;
    description?: string;
    newsId?: number;
    voteType?: number;
    voteLimit?: number;
      deadline?: number | string | Date;
      desc?: string;
      voteLim?: number;
      optionList?: { optionContent: string; optionPhotoUrl?: string }[];
      options?: { optionContent: string; optionPhotoUrl?: string }[];
  }) {
    const options = data.options ?? data.optionList ?? [];
    const deadline = this.normalizeDeadline(data.deadline);
    const vote = this.voteRepo.create({
      title: data.title,
      ...(data.description !== undefined && { description: data.description }),
      ...(data.desc !== undefined && { description: data.desc }),
      ...(data.newsId !== undefined && { newsId: data.newsId }),
      authorId,
      voteType: data.voteType || 1,
      voteLimit: data.voteLimit || data.voteLim || 1,
      ...(deadline !== undefined && { deadline }),
    });

    await this.voteRepo.save(vote);

    // 创建选项
    for (const opt of options) {
      const option = this.voteOptionRepo.create({
        voteId: vote.id,
        ...opt,
      });
      await this.voteOptionRepo.save(option);
    }

    // 如果有关联动态，更新动态的投票信息
    if (data.newsId) {
      await this.newsRepo.update({ id: data.newsId }, { voteId: vote.id });
    }

    return { voteId: vote.id };
  }
}

export const voteService = new VoteService();
