import { AppDataSource } from '../../database/connection.js';
import { Article, News, User, Tag, Like, Vote } from '../../entity/index.js';
import { NotFoundError, BadRequestError } from '../../utils/helper.js';
import { voteService } from '../vote/service.js';

export class NewsService {
  private newsRepo = AppDataSource.getRepository(News);
  private userRepo = AppDataSource.getRepository(User);
  private tagRepo = AppDataSource.getRepository(Tag);
  private likeRepo = AppDataSource.getRepository(Like);
  private voteRepo = AppDataSource.getRepository(Vote);
  private articleRepo = AppDataSource.getRepository(Article);

  async getPrepareInfo(_userId?: number) {
    // 获取最近使用的标签
    const recentTags = await this.tagRepo.find({
      order: { useCount: 'DESC' },
      take: 8,
    });

    // 获取关注的用户
    const followers = await this.userRepo.find({
      select: ['id', 'nickname', 'avatar', 'followerCount'],
      order: { createdAt: 'DESC' },
      take: 8,
    });

    return {
      recentTagList: recentTags.map((t) => ({
        tagId: t.id,
        content: t.name,
        viewNum: t.useCount,
        discussNum: t.useCount,
      })),
      followerList: followers.map((f) => ({
        userId: f.id,
        username: f.nickname || f.phone,
        avatarUrl: f.avatar,
        fansNumInfo: f.followerCount,
      })),
      sideBarUrl: '/imgs/slide-bar.jpg',
    };
  }

  async publishNews(authorId: number, data: Partial<News> & {
    tagId?: number | string;
    pubTime?: string;
    voteInfo?: Record<string, unknown>;
    bookLiveInfo?: Record<string, unknown> | null;
  }) {
    const user = await this.userRepo.findOne({ where: { id: authorId } });
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const publishedAt = data.pubTime ? new Date(data.pubTime) : new Date();
    const tag = data.tag ?? (data.tagId !== undefined ? String(data.tagId) : undefined);
    const news = this.newsRepo.create({
      ...data,
      ...(tag !== undefined && { tag }),
      ...(data.bookLiveInfo !== undefined && data.bookLiveInfo !== null && {
        bookLiveInfo: {
          ...data.bookLiveInfo,
          bookLiveId: Date.now(),
          bookNumInfo: 0,
          booked: 1,
          canceled: 0,
          liveTimeInfo: data.bookLiveInfo.liveTime,
          anchorName: user.nickname || user.phone,
        },
      }),
      authorId,
      status: 'published',
      publishedAt,
    });

    await this.newsRepo.save(news);

    if (data.voteInfo) {
      const vote = await voteService.createVote(authorId, {
        ...(data.voteInfo as any),
        newsId: news.id,
      });
      news.voteId = vote.voteId;
      await this.newsRepo.save(news);
    }

    // 更新用户动态计数
    await this.userRepo.increment({ id: authorId }, 'articleCount', 1);

    // 更新标签使用次数
    if (data.tag) {
      const tag = await this.tagRepo.findOne({ where: { name: data.tag } });
      if (tag) {
        await this.tagRepo.increment({ id: tag.id }, 'useCount', 1);
      } else {
        const newTag = this.tagRepo.create({ name: data.tag, useCount: 1 });
        await this.tagRepo.save(newTag);
      }
    }

    return { happeningId: news.id };
  }

  async getNewsList(params: {
    page?: number;
    pageSize?: number;
    userId?: number;
    tag?: string;
  }) {
    const { page = 1, pageSize = 10, userId } = params;
    const where: Record<string, unknown> = { status: 'published' };

    if (userId) {
      where.authorId = userId;
    }

    const [newsList, total] = await this.newsRepo.findAndCount({
      where,
      relations: ['author'],
      order: { publishedAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const records = await Promise.all(
      newsList.map(async (news) => ({
        happeningInfo: {
          happeningId: news.id,
          title: news.title || '',
          content: news.content,
          atUserInfoList: news.atUserInfoList || [],
          tag: news.tag || '',
          viewNumInfo: news.viewCount,
          likeNumInfo: String(news.likeCount),
          commentNumInfo: news.commentCount,
          forwardNumInfo: news.forwardCount,
          commentAble: news.commentAble,
          advanceRelease: news.advanceRelease,
          voteSimpleInfo: news.voteId
            ? await this.getVoteSimpleInfo(news.voteId)
            : null,
          bookLiveInfo: news.bookLiveInfo || null,
          quotedHappening: news.quotedHappening || null,
          articleInfo: news.articleInfo || null,
          imgUrlList: news.imgUrlList || [],
          pubTimeInfo: news.publishedAt?.toISOString() || '',
        },
        publisherInfo: {
          userId: news.author.id,
          username: news.author.nickname || news.author.phone,
          avatarUrl: news.author.avatar,
        },
      }))
    );

    return { total, records };
  }

  async getNewsDetail(happeningId: number, _userId?: number) {
    const news = await this.newsRepo.findOne({
      where: { id: happeningId },
      relations: ['author'],
    });

    if (!news) {
      const article = await this.articleRepo.findOne({
        where: { id: happeningId },
        relations: ['author'],
      });

      if (article) {
        return {
          happeningInfo: {
            happeningId: article.id,
            title: '',
            content: '',
            atUserInfoList: [],
            tag: article.tags?.[0] || '',
            viewNumInfo: article.viewCount,
            likeNumInfo: String(article.likeCount),
            commentNumInfo: article.commentCount,
            forwardNumInfo: 0,
            commentAble: article.commentAble,
            advanceRelease: 0,
            voteSimpleInfo: null,
            bookLiveInfo: null,
            quotedHappening: null,
            articleInfo: {
              articleId: article.id,
              title: article.title,
              summary: article.summary || '',
            },
            imgUrlList: [],
            pubTimeInfo: article.publishedAt?.toISOString() || '',
          },
          publisherInfo: {
            userId: article.author.id,
            username: article.author.nickname || article.author.phone,
            avatarUrl: article.author.avatar,
          },
        };
      }

      throw new NotFoundError('动态不存在');
    }

    // 增加浏览次数
    await this.newsRepo.increment({ id: happeningId }, 'viewCount', 1);

    return {
      happeningInfo: {
        happeningId: news.id,
        title: news.title || '',
        content: news.content,
        atUserInfoList: news.atUserInfoList || [],
        tag: news.tag || '',
        viewNumInfo: news.viewCount + 1,
        likeNumInfo: String(news.likeCount),
        commentNumInfo: news.commentCount,
        forwardNumInfo: news.forwardCount,
        commentAble: news.commentAble,
        advanceRelease: news.advanceRelease,
        voteSimpleInfo: news.voteId
          ? await this.getVoteSimpleInfo(news.voteId)
          : null,
        bookLiveInfo: news.bookLiveInfo || null,
        quotedHappening: news.quotedHappening || null,
        articleInfo: news.articleInfo || null,
        imgUrlList: news.imgUrlList || [],
        pubTimeInfo: news.publishedAt?.toISOString() || '',
      },
      publisherInfo: {
        userId: news.author.id,
        username: news.author.nickname || news.author.phone,
        avatarUrl: news.author.avatar,
      },
    };
  }

  async updateNews(newsId: number, authorId: number, data: Partial<News>) {
    const news = await this.newsRepo.findOne({
      where: { id: newsId, authorId },
    });

    if (!news) {
      throw new NotFoundError('动态不存在或无权限修改');
    }

    Object.assign(news, data);
    await this.newsRepo.save(news);

    return { message: '修改成功' };
  }

  async deleteNews(newsId: number, authorId: number) {
    const news = await this.newsRepo.findOne({
      where: { id: newsId, authorId },
    });

    if (!news) {
      throw new NotFoundError('动态不存在或无权限删除');
    }

    await this.newsRepo.remove(news);

    // 更新用户动态计数
    await this.userRepo.decrement({ id: authorId }, 'articleCount', 1);

    return { message: '删除成功' };
  }

  async forwardNews(authorId: number, originalNewsId: number, content?: string) {
    const originalNews = await this.newsRepo.findOne({
      where: { id: originalNewsId },
      relations: ['author'],
    });

    if (!originalNews) {
      throw new NotFoundError('原动态不存在');
    }

    const forwardNews = this.newsRepo.create({
      authorId,
      content: content || '',
      quotedHappeningId: originalNewsId,
      quotedHappening: {
        happeningInfo: {
          happeningId: originalNews.id,
          title: originalNews.title || '',
          content: originalNews.content,
          atUserInfoList: originalNews.atUserInfoList || [],
          tag: originalNews.tag || '',
          viewNumInfo: originalNews.viewCount,
          likeNumInfo: String(originalNews.likeCount),
          commentNumInfo: originalNews.commentCount,
          forwardNumInfo: originalNews.forwardCount,
          commentAble: originalNews.commentAble,
          advanceRelease: originalNews.advanceRelease,
          voteSimpleInfo: null,
          bookLiveInfo: originalNews.bookLiveInfo || null,
          quotedHappening: null,
          articleInfo: originalNews.articleInfo || null,
          imgUrlList: originalNews.imgUrlList || [],
          pubTimeInfo: originalNews.publishedAt?.toISOString() || '',
        },
        publisherInfo: {
          userId: originalNews.author.id,
          username: originalNews.author.nickname || originalNews.author.phone,
          avatarUrl: originalNews.author.avatar,
        },
      },
      status: 'published',
      publishedAt: new Date(),
    });

    await this.newsRepo.save(forwardNews);

    // 增加原动态转发数
    await this.newsRepo.increment({ id: originalNewsId }, 'forwardCount', 1);

    return { happeningId: forwardNews.id };
  }

  async likeNews(userId: number, newsId: number) {
    const news = await this.newsRepo.findOne({ where: { id: newsId } });
    if (!news) {
      throw new NotFoundError('动态不存在');
    }

    const existLike = await this.likeRepo.findOne({
      where: { userId, targetType: 'news', targetId: newsId },
    });

    if (existLike) {
      throw new BadRequestError('已点赞');
    }

    const like = this.likeRepo.create({ userId, targetType: 'news', targetId: newsId });
    await this.likeRepo.save(like);

    await this.newsRepo.increment({ id: newsId }, 'likeCount', 1);

    return { message: '点赞成功' };
  }

  async unlikeNews(userId: number, newsId: number) {
    const like = await this.likeRepo.findOne({
      where: { userId, targetType: 'news', targetId: newsId },
    });

    if (!like) {
      throw new BadRequestError('未点赞');
    }

    await this.likeRepo.remove(like);
    await this.newsRepo.decrement({ id: newsId }, 'likeCount', 1);

    return { message: '取消点赞成功' };
  }

  async getLikeList(newsId: number, page = 1, pageSize = 20) {
    const [likes, total] = await this.likeRepo.findAndCount({
      where: { targetType: 'news', targetId: newsId },
      relations: ['user'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const records = likes.map((l) => ({
      userId: l.user.id,
      username: l.user.nickname || l.user.phone,
      avatarUrl: l.user.avatar,
    }));

    return { total, records };
  }

  async getForwardList(newsId: number, page = 1, pageSize = 20) {
    const [forwards, total] = await this.newsRepo.findAndCount({
      where: { quotedHappeningId: newsId, status: 'published' },
      relations: ['author'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const records = forwards.map((f) => ({
      userId: f.author.id,
      username: f.author.nickname || f.author.phone,
      avatarUrl: f.author.avatar,
    }));

    return { total, records };
  }

  private async getVoteSimpleInfo(voteId: number) {
    const vote = await this.voteRepo.findOne({ where: { id: voteId } });
    if (!vote) return null;

    return {
      voteId: vote.id,
      title: vote.title,
      voteNumInfo: String(vote.totalCount),
    };
  }
}

export const newsService = new NewsService();
