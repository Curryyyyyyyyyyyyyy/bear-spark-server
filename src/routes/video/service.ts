import { AppDataSource } from '../../database/connection.js';
import { Video, User, Category, Like } from '../../entity/index.js';
import { NotFoundError } from '../../utils/helper.js';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { formatDisplayTime } from '../../utils/time.js';

type PublishVideoInput = Partial<Video> & {
  videoFileHash?: string;
  coverFileHash?: string;
  videoUrl?: string;
  coverUrl?: string;
};

const uploadRoot = join(process.cwd(), 'public', 'uploads');
const defaultAvatar = '/imgs/default-avatar.png';

function findUploadedUrl(fileHash?: string) {
  if (!fileHash || !existsSync(uploadRoot)) return undefined;

  const safeHash = fileHash.replace(/[^a-zA-Z0-9_-]/g, '');
  const file = readdirSync(uploadRoot).find((item) => item === safeHash || item.startsWith(`${safeHash}.`));

  return file ? `/bear-spark/uploads/${file}` : undefined;
}

function formatDuration(duration?: number) {
  const seconds = Math.max(0, Math.floor(duration || 0));
  const minute = Math.floor(seconds / 60);
  const second = String(seconds % 60).padStart(2, '0');
  return `${minute}:${second}`;
}

export class VideoService {
  private videoRepo = AppDataSource.getRepository(Video);
  private userRepo = AppDataSource.getRepository(User);
  private categoryRepo = AppDataSource.getRepository(Category);
  private likeRepo = AppDataSource.getRepository(Like);

  async publishVideo(authorId: number, data: PublishVideoInput) {
    const user = await this.userRepo.findOne({ where: { id: authorId } });
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const url = data.url || data.videoUrl || findUploadedUrl(data.videoFileHash);
    if (!url) {
      throw new NotFoundError('视频文件未上传完成');
    }

    const coverImage = data.coverImage || data.coverUrl || findUploadedUrl(data.coverFileHash);
    const video = this.videoRepo.create({
      title: data.title || '未命名视频',
      ...(data.description !== undefined && { description: data.description }),
      url,
      ...(coverImage !== undefined && { coverImage }),
      ...(data.duration !== undefined && { duration: Math.round(Number(data.duration)) }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.commentAble !== undefined && { commentAble: data.commentAble }),
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
      videoTitle: v.title,
      title: v.title,
      description: v.description,
      videoUrl: v.url,
      url: v.url,
      coverUrl: v.coverImage,
      coverImage: v.coverImage,
      duration: v.duration,
      videoDurationInfo: formatDuration(v.duration),
      viewCount: v.viewCount,
      likeCount: v.likeCount,
      commentCount: v.commentCount,
      publishTimeInfo: formatDisplayTime(v.publishedAt),
      publishedAt: v.publishedAt,
      authorId: v.author.id,
      authorName: v.author.nickname || v.author.phone,
      author: {
        userId: v.author.id,
        username: v.author.nickname || v.author.phone,
        avatarUrl: v.author.avatar || defaultAvatar,
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
      videoTitle: video.title,
      title: video.title,
      description: video.description,
      videoUrl: video.url,
      url: video.url,
      coverUrl: video.coverImage,
      coverImage: video.coverImage,
      duration: video.duration,
      videoDurationInfo: formatDuration(video.duration),
      viewCount: video.viewCount + 1,
      likeCount: video.likeCount,
      commentCount: video.commentCount,
      liked: liked ? 1 : 0,
      publishTimeInfo: formatDisplayTime(video.publishedAt),
      publishedAt: video.publishedAt,
      authorId: video.author.id,
      authorName: video.author.nickname || video.author.phone,
      author: {
        userId: video.author.id,
        username: video.author.nickname || video.author.phone,
        avatarUrl: video.author.avatar || defaultAvatar,
      },
      authorInfo: {
        userId: video.author.id,
        username: video.author.nickname || video.author.phone,
        avatarUrl: video.author.avatar || defaultAvatar,
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
