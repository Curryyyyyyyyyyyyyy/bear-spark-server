import { AppDataSource } from '../../database/connection.js';
import { Video, User, Category, Like } from '../../entity/index.js';
import { NotFoundError } from '../../utils/helper.js';

export class VideoService {
  private videoRepo = AppDataSource.getRepository(Video);
  private userRepo = AppDataSource.getRepository(User);
  private categoryRepo = AppDataSource.getRepository(Category);
  private likeRepo = AppDataSource.getRepository(Like);

  async publishVideo(authorId: number, data: Partial<Video>) {
    const user = await this.userRepo.findOne({ where: { id: authorId } });
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const video = this.videoRepo.create({
      ...data,
      authorId,
      status: 'published',
      publishedAt: new Date(),
    });

    await this.videoRepo.save(video);
    await this.userRepo.increment({ id: authorId }, 'videoCount', 1);

    if (data.categoryId) {
      await this.categoryRepo.increment({ id: data.categoryId }, 'videoCount', 1);
    }

    return { videoId: video.id };
  }

  async getVideoList(params: { page?: number; pageSize?: number; categoryId?: number; userId?: number }) {
    const { page = 1, pageSize = 10, categoryId, userId } = params;
    const where: Record<string, unknown> = { status: 'published' };

    if (categoryId) where.categoryId = categoryId;
    if (userId) where.authorId = userId;

    const [videos, total] = await this.videoRepo.findAndCount({
      where,
      relations: ['author'],
      order: { publishedAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const records = videos.map((v) => ({
      videoId: v.id,
      title: v.title,
      description: v.description,
      url: v.url,
      coverImage: v.coverImage,
      duration: v.duration,
      viewCount: v.viewCount,
      likeCount: v.likeCount,
      commentCount: v.commentCount,
      publishedAt: v.publishedAt,
      author: {
        userId: v.author.id,
        username: v.author.nickname,
        avatarUrl: v.author.avatar,
      },
    }));

    return { total, records };
  }

  async getVideoDetail(videoId: number, userId?: number) {
    const video = await this.videoRepo.findOne({
      where: { id: videoId },
      relations: ['author', 'category'],
    });

    if (!video) {
      throw new NotFoundError('视频不存在');
    }

    await this.videoRepo.increment({ id: videoId }, 'viewCount', 1);

    let liked = false;
    if (userId) {
      const like = await this.likeRepo.findOne({
        where: { userId, targetType: 'video', targetId: videoId },
      });
      liked = !!like;
    }

    return {
      videoId: video.id,
      title: video.title,
      description: video.description,
      url: video.url,
      coverImage: video.coverImage,
      duration: video.duration,
      viewCount: video.viewCount + 1,
      likeCount: video.likeCount,
      commentCount: video.commentCount,
      liked: liked ? 1 : 0,
      publishedAt: video.publishedAt,
      author: {
        userId: video.author.id,
        username: video.author.nickname,
        avatarUrl: video.author.avatar,
      },
    };
  }

  async updateVideo(videoId: number, authorId: number, data: Partial<Video>) {
    const video = await this.videoRepo.findOne({
      where: { id: videoId, authorId },
    });

    if (!video) {
      throw new NotFoundError('视频不存在或无权限修改');
    }

    Object.assign(video, data);
    await this.videoRepo.save(video);
    return { message: '修改成功' };
  }

  async deleteVideo(videoId: number, authorId: number) {
    const video = await this.videoRepo.findOne({
      where: { id: videoId, authorId },
    });

    if (!video) {
      throw new NotFoundError('视频不存在或无权限删除');
    }

    await this.videoRepo.remove(video);
    await this.userRepo.decrement({ id: authorId }, 'videoCount', 1);

    if (video.categoryId) {
      await this.categoryRepo.decrement({ id: video.categoryId }, 'videoCount', 1);
    }

    return { message: '删除成功' };
  }

  async likeVideo(userId: number, videoId: number) {
    const video = await this.videoRepo.findOne({ where: { id: videoId } });
    if (!video) {
      throw new NotFoundError('视频不存在');
    }

    const existLike = await this.likeRepo.findOne({
      where: { userId, targetType: 'video', targetId: videoId },
    });

    if (existLike) {
      throw new NotFoundError('已点赞');
    }

    const like = this.likeRepo.create({ userId, targetType: 'video', targetId: videoId });
    await this.likeRepo.save(like);
    await this.videoRepo.increment({ id: videoId }, 'likeCount', 1);

    return { message: '点赞成功' };
  }
}

export const videoService = new VideoService();
