import { AppDataSource } from '../../database/connection.js';
import { Comment, Article, News, Video, Like } from '../../entity/index.js';
import { NotFoundError, BadRequestError } from '../../utils/helper.js';
import { formatDisplayTime } from '../../utils/time.js';

export class CommentService {
  private commentRepo = AppDataSource.getRepository(Comment);
  private articleRepo = AppDataSource.getRepository(Article);
  private newsRepo = AppDataSource.getRepository(News);
  private videoRepo = AppDataSource.getRepository(Video);
  private likeRepo = AppDataSource.getRepository(Like);

  async getBldgComment(happeningId: number, page = 1, pageSize = 20) {
    // 获取顶级评论（楼评论）
    const [comments, total] = await this.commentRepo.findAndCount({
      where: { entityType: 'news', entityId: happeningId, parentId: null as any },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 获取子回复数量
    for (const comment of comments) {
      comment.replyCount = await this.commentRepo.count({
        where: { parentId: comment.id },
      });
    }

    const bldgCommentList = comments.map((c) => ({
      commentId: c.id,
      content: c.content,
      atUserInfoList: c.atUserInfoList || [],
      pubTimeInfo: formatDisplayTime(c.createdAt),
      likeNumInfo: String(c.likeCount),
      liked: 0,
      replyNumInfo: c.replyCount,
      replyNum: c.replyCount * 2,
      userInfo: {
        userId: c.author.id,
        username: c.author.nickname || c.author.phone,
        avatarUrl: c.author.avatar,
      },
    }));

    return { total, bldgTotal: total, bldgCommentList };
  }

  async getLayerComment(parentId: number, page = 1, pageSize = 20) {
    // 获取子评论（层评论）
    const [comments, total] = await this.commentRepo.findAndCount({
      where: { parentId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const layerCommentList = comments.map((c) => ({
      commentId: c.id,
      content: c.content,
      atUserInfoList: c.atUserInfoList || [],
      pubTimeInfo: formatDisplayTime(c.createdAt),
      likeNumInfo: String(c.likeCount),
      liked: 0,
      repliedUserId: c.parentId,
      repliedUserName: '',
      userInfo: {
        userId: c.author.id,
        username: c.author.nickname || c.author.phone,
        avatarUrl: c.author.avatar,
      },
    }));

    return { total, layerCommentList };
  }

  async commentHappening(authorId: number, data: {
    happeningId: number;
    content: string;
    atUserInfoList?: { username: string; userId: number }[];
  }) {
    const news = await this.newsRepo.findOne({ where: { id: data.happeningId } });
    if (!news) {
      throw new NotFoundError('动态不存在');
    }

    const comment = this.commentRepo.create({
      authorId,
      entityType: 'news',
      entityId: data.happeningId,
      content: data.content,
      ...(data.atUserInfoList !== undefined && { atUserInfoList: data.atUserInfoList }),
    });

    await this.commentRepo.save(comment);
    await this.newsRepo.increment({ id: data.happeningId }, 'commentCount', 1);

    return { commentId: comment.id };
  }

  async replyComment(authorId: number, data: {
    parentId: number;
    content: string;
    atUserInfoList?: { username: string; userId: number }[];
  }) {
    const parentComment = await this.commentRepo.findOne({
      where: { id: data.parentId },
    });

    if (!parentComment) {
      throw new NotFoundError('评论不存在');
    }

    const comment = this.commentRepo.create({
      authorId,
      entityType: parentComment.entityType,
      entityId: parentComment.entityId,
      parentId: data.parentId,
      content: data.content,
      ...(data.atUserInfoList !== undefined && { atUserInfoList: data.atUserInfoList }),
    });

    await this.commentRepo.save(comment);

    // 更新实体评论数
    await this.incrementCommentCount(parentComment.entityType, parentComment.entityId);

    // 增加父评论回复数
    await this.commentRepo.increment({ id: data.parentId }, 'replyCount', 1);

    return { commentId: comment.id };
  }

  async deleteComment(commentId: number, authorId: number) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId, authorId },
    });

    if (!comment) {
      throw new NotFoundError('评论不存在或无权限删除');
    }

    await this.commentRepo.remove(comment);

    // 更新实体评论数
    await this.decrementCommentCount(comment.entityType, comment.entityId);

    // 如果有父评论，减少父评论回复数
    if (comment.parentId) {
      await this.commentRepo.decrement({ id: comment.parentId }, 'replyCount', 1);
    }

    return { message: '删除成功' };
  }

  async likeComment(userId: number, commentId: number) {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundError('评论不存在');
    }

    const existLike = await this.likeRepo.findOne({
      where: { userId, targetType: 'comment', targetId: commentId },
    });

    if (existLike) {
      throw new BadRequestError('已点赞');
    }

    const like = this.likeRepo.create({ userId, targetType: 'comment', targetId: commentId });
    await this.likeRepo.save(like);
    await this.commentRepo.increment({ id: commentId }, 'likeCount', 1);

    return { message: '点赞成功' };
  }

  private async incrementCommentCount(entityType: string, entityId: number) {
    if (entityType === 'news') {
      await this.newsRepo.increment({ id: entityId }, 'commentCount', 1);
    } else if (entityType === 'article') {
      await this.articleRepo.increment({ id: entityId }, 'commentCount', 1);
    } else if (entityType === 'video') {
      await this.videoRepo.increment({ id: entityId }, 'commentCount', 1);
    }
  }

  private async decrementCommentCount(entityType: string, entityId: number) {
    if (entityType === 'news') {
      await this.newsRepo.decrement({ id: entityId }, 'commentCount', 1);
    } else if (entityType === 'article') {
      await this.articleRepo.decrement({ id: entityId }, 'commentCount', 1);
    } else if (entityType === 'video') {
      await this.videoRepo.decrement({ id: entityId }, 'commentCount', 1);
    }
  }
}

export const commentService = new CommentService();
