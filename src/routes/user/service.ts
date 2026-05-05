import { AppDataSource } from '../../database/connection.js';
import { Article, Follow, News, User, Video } from '../../entity/index.js';
import { NotFoundError, BadRequestError } from '../../utils/helper.js';
import { formatDisplayTime } from '../../utils/time.js';


export class UserService {
  private userRepo = AppDataSource.getRepository(User);
  private followRepo = AppDataSource.getRepository(Follow);
  private newsRepo = AppDataSource.getRepository(News);
  private articleRepo = AppDataSource.getRepository(Article);
  private videoRepo = AppDataSource.getRepository(Video);

  async getUserInfo(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const [followingCount, fanCount, newsCount, articleCount, videoCount] = await Promise.all([
      this.followRepo.count({ where: { followerId: userId } }),
      this.followRepo.count({ where: { followingId: userId } }),
      this.newsRepo.count({ where: { authorId: userId, status: 'published' } }),
      this.articleRepo.count({ where: { authorId: userId, status: 'published' } }),
      this.videoRepo.count({ where: { authorId: userId, status: 'published' } }),
    ]);

    return {
      userId: user.id,
      phone: user.phone,
      nickname: user.nickname,
      username: user.nickname || user.phone,
      avatar: user.avatar,
      avatarUrl: user.avatar,
      bio: user.bio,
      followerNumInfo: followingCount,
      fanNumInfo: fanCount,
      happeningNumInfo: newsCount + articleCount + videoCount,
      currencyInfo: {
        meritNumInfo: user.meritCount,
        coinNumInfo: user.coinCount,
      },
      followingCount,
      followerCount: fanCount,
      articleCount,
      videoCount,
      newsCount,
      createdAt: user.createdAt,
      createdAtInfo: formatDisplayTime(user.createdAt),
    };
  }

  async updateUserInfo(userId: number, data: Partial<User>) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const { password, ...rest } = data;
    if (password) {
      throw new BadRequestError('请使用修改密码接口');
    }

    Object.assign(user, rest);
    await this.userRepo.save(user);

    return {
      userId: user.id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
    };
  }

  async getFollowerList(userId: number, page = 1, pageSize = 20) {
    const [follows, total] = await this.followRepo.findAndCount({
      where: { followingId: userId },
      relations: ['follower'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    const followerList = follows.map((f) => ({
      userId: f.follower.id,
      phone: f.follower.phone,
      username: f.follower.nickname || f.follower.phone,
      avatarUrl: f.follower.avatar,
      fansNumInfo: f.follower.followerCount,
    }));

    return { total, records: followerList };
  }

  async getFollowingList(userId: number, page = 1, pageSize = 20) {
    const [follows, total] = await this.followRepo.findAndCount({
      where: { followerId: userId },
      relations: ['following'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    const followingList = follows.map((f) => ({
      userId: f.following.id,
      phone: f.following.phone,
      username: f.following.nickname || f.following.phone,
      avatarUrl: f.following.avatar,
      fansNumInfo: f.following.followerCount,
    }));

    return { total, records: followingList };
  }

  async follow(followerId: number, followingId: number) {
    if (followerId === followingId) {
      throw new BadRequestError('不能关注自己');
    }

    const followingUser = await this.userRepo.findOne({ where: { id: followingId } });
    if (!followingUser) {
      throw new NotFoundError('用户不存在');
    }

    const existFollow = await this.followRepo.findOne({
      where: { followerId, followingId },
    });
    if (existFollow) {
      throw new BadRequestError('已关注该用户');
    }

    const follow = this.followRepo.create({ followerId, followingId });
    await this.followRepo.save(follow);

    // 更新计数
    await this.userRepo.increment({ id: followerId }, 'followingCount', 1);
    await this.userRepo.increment({ id: followingId }, 'followerCount', 1);

    return { message: '关注成功' };
  }

  async unfollow(followerId: number, followingId: number) {
    const follow = await this.followRepo.findOne({
      where: { followerId, followingId },
    });
    if (!follow) {
      throw new BadRequestError('未关注该用户');
    }

    await this.followRepo.remove(follow);

    // 更新计数
    await this.userRepo.decrement({ id: followerId }, 'followingCount', 1);
    await this.userRepo.decrement({ id: followingId }, 'followerCount', 1);

    return { message: '取消关注成功' };
  }
}

export const userService = new UserService();
