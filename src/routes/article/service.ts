import { AppDataSource } from '../../database/connection.js';
import { Article, User, Category, Collect, Like } from '../../entity/index.js';
import { NotFoundError, BadRequestError } from '../../utils/helper.js';

export class ArticleService {
  private articleRepo = AppDataSource.getRepository(Article);
  private userRepo = AppDataSource.getRepository(User);
  private categoryRepo = AppDataSource.getRepository(Category);
  private collectRepo = AppDataSource.getRepository(Collect);
  private likeRepo = AppDataSource.getRepository(Like);

  async publishArticle(authorId: number, data: Partial<Article>) {
    const user = await this.userRepo.findOne({ where: { id: authorId } });
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const article = this.articleRepo.create({
      ...data,
      authorId,
      status: 'published',
      publishedAt: new Date(),
    });

    await this.articleRepo.save(article);

    // 更新用户文章计数
    await this.userRepo.increment({ id: authorId }, 'articleCount', 1);

    // 更新分类文章计数
    if (data.categoryId) {
      await this.categoryRepo.increment({ id: data.categoryId }, 'articleCount', 1);
    }

    return { articleId: article.id };
  }

  async getArticleInfo(articleId: number) {
    const article = await this.articleRepo.findOne({
      where: { id: articleId },
      relations: ['author', 'category'],
    });

    if (!article) {
      throw new NotFoundError('文章不存在');
    }

    const categoryInfoList = article.category
      ? [{ categoryId: article.category.id, categoryName: article.category.name }]
      : [];

    return {
      title: article.title,
      summary: article.summary,
      content: article.content,
      coverUrl: article.coverImage,
      tagId: article.tags?.[0] || null,
      tag: article.tags?.[0] || '',
      categoryInfoList,
      visibility: article.visibility,
      commentAble: article.commentAble,
      declaration: article.declaration,
      reprintArticleUrl: article.reprintArticleUrl,
    };
  }

  async getArticleDetail(articleId: number, userId?: number) {
    const article = await this.articleRepo.findOne({
      where: { id: articleId },
      relations: ['author', 'category'],
    });

    if (!article) {
      throw new NotFoundError('文章不存在');
    }

    // 增加浏览次数
    await this.articleRepo.increment({ id: articleId }, 'viewCount', 1);

    // 检查用户是否点赞、收藏、打赏
    let liked = false;
    let collected = false;
    let merited = false;

    if (userId) {
      const like = await this.likeRepo.findOne({
        where: { userId, targetType: 'article', targetId: articleId },
      });
      liked = !!like;

      const collect = await this.collectRepo.findOne({
        where: { userId, articleId },
      });
      collected = !!collect;
    }

    const categoryInfoList = article.category
      ? [{ categoryId: article.category.id, categoryName: article.category.name }]
      : [];

    return {
      articleId: article.id,
      title: article.title,
      summary: article.summary,
      content: article.content,
      coverUrl: article.coverImage,
      tagId: article.tags?.[0] || null,
      tag: article.tags?.[0] || '',
      categoryInfoList,
      visibility: article.visibility,
      commentAble: article.commentAble,
      declaration: article.declaration,
      reprintArticleUrl: article.reprintArticleUrl,
      likeNumInfo: String(article.likeCount),
      meritNumInfo: String(article.meritCount),
      collectNumInfo: String(article.collectCount),
      forwardNumInfo: '0',
      commentNumInfo: article.commentCount,
      liked: liked ? 1 : 0,
      merited: merited ? 1 : 0,
      collected: collected ? 1 : 0,
      pubTimeInfo: article.publishedAt?.toISOString() || '',
      publisherInfo: {
        userId: article.author.id,
        username: article.author.username,
        avatarUrl: article.author.avatar,
      },
    };
  }

  async getArticleList(params: {
    pageNum: number;
    pageSize: number;
    categoryId?: number;
    listedUserId?: number;
  }) {
    const { pageNum, pageSize, categoryId, listedUserId } = params;
    const where: Record<string, unknown> = { status: 'published' };

    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (listedUserId) {
      where.authorId = listedUserId;
    }

    const [articles, total] = await this.articleRepo.findAndCount({
      where,
      relations: ['author'],
      order: { publishedAt: 'DESC' },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });

    const records = articles.map((a) => ({
      articleId: a.id,
      title: a.title,
      coverUrl: a.coverImage,
      summary: a.summary,
      declaration: a.declaration,
      likeNumInfo: String(a.likeCount),
      viewNumInfo: a.viewCount,
      commentNumInfo: a.commentCount,
      collectNumInfo: String(a.collectCount),
      pubTimeInfo: a.publishedAt?.toISOString() || '',
    }));

    return { total, records };
  }

  async updateArticle(articleId: number, authorId: number, data: Partial<Article>) {
    const article = await this.articleRepo.findOne({
      where: { id: articleId, authorId },
    });

    if (!article) {
      throw new NotFoundError('文章不存在或无权限修改');
    }

    Object.assign(article, data);
    await this.articleRepo.save(article);

    return { message: '修改成功' };
  }

  async deleteArticle(articleId: number, authorId: number) {
    const article = await this.articleRepo.findOne({
      where: { id: articleId, authorId },
    });

    if (!article) {
      throw new NotFoundError('文章不存在或无权限删除');
    }

    await this.articleRepo.remove(article);

    // 更新用户文章计数
    await this.userRepo.decrement({ id: authorId }, 'articleCount', 1);

    // 更新分类文章计数
    if (article.categoryId) {
      await this.categoryRepo.decrement({ id: article.categoryId }, 'articleCount', 1);
    }

    return { message: '删除成功' };
  }

  async collectArticle(userId: number, articleId: number, collected: boolean) {
    const article = await this.articleRepo.findOne({ where: { id: articleId } });
    if (!article) {
      throw new NotFoundError('文章不存在');
    }

    const existCollect = await this.collectRepo.findOne({
      where: { userId, articleId },
    });

    if (collected && existCollect) {
      throw new BadRequestError('已收藏');
    }

    if (collected) {
      const collect = this.collectRepo.create({ userId, articleId });
      await this.collectRepo.save(collect);
      await this.articleRepo.increment({ id: articleId }, 'collectCount', 1);
    } else {
      if (!existCollect) {
        throw new BadRequestError('未收藏');
      }
      await this.collectRepo.remove(existCollect);
      await this.articleRepo.decrement({ id: articleId }, 'collectCount', 1);
    }

    return { message: collected ? '收藏成功' : '取消收藏成功' };
  }

  async giveMerit(userId: number, articleId: number) {
    const article = await this.articleRepo.findOne({
      where: { id: articleId },
      relations: ['author'],
    });
    if (!article) {
      throw new NotFoundError('文章不存在');
    }

    if (article.authorId === userId) {
      throw new BadRequestError('不能给自己打赏');
    }

    await this.articleRepo.increment({ id: articleId }, 'meritCount', 1);
    await this.userRepo.increment({ id: article.authorId }, 'meritCount', 1);

    return { message: '打赏成功' };
  }

  async likeArticle(userId: number, articleId: number) {
    const article = await this.articleRepo.findOne({ where: { id: articleId } });
    if (!article) {
      throw new NotFoundError('文章不存在');
    }

    const existLike = await this.likeRepo.findOne({
      where: { userId, targetType: 'article', targetId: articleId },
    });

    if (existLike) {
      throw new BadRequestError('已点赞');
    }

    const like = this.likeRepo.create({ userId, targetType: 'article', targetId: articleId });
    await this.likeRepo.save(like);
    await this.articleRepo.increment({ id: articleId }, 'likeCount', 1);

    return { message: '点赞成功' };
  }
}

export const articleService = new ArticleService();
