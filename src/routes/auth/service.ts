import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../../database/connection.js';
import { User } from '../../entity/index.js';
import { config } from '../../config/index.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '../../utils/helper.js';
import type { JwtPayload } from '../../types/index.js';
import { nanoid } from 'nanoid';

function generateNickname(): string {
  return `用户_${nanoid(8)}`;
}

export class AuthService {
  private userRepo = AppDataSource.getRepository(User);

  async login(phone: string, password: string) {
    const user = await this.userRepo.findOne({
      where: [{ phone }],
    });

    if (!user) {
      throw new UnauthorizedError('手机号或密码错误');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('手机号或密码错误');
    }

    const payload: JwtPayload = { userId: user.id, phone: user.phone };
    const token = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    return {
      token,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    };
  }

  async register(
    phone: string,
    password: string,
  ) {
    const existUser = await this.userRepo.findOne({
      where: [{ phone }],
    });

    if (existUser) {
      throw new ConflictError('手机号已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      phone,
      password: hashedPassword,
      nickname: generateNickname(),
    });

    await this.userRepo.save(user);

    const payload: JwtPayload = { userId: user.id, phone: user.phone };
    const token = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    return {
      token,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    };
  }

  async sendVerifyCode(phone: string) {
    // 生成6位验证码
    const code = '200501';
    // TODO: 发送邮件验证码
    // 这里简单存储到缓存，实际应使用Redis
    console.log(`[Verify Code] ${phone}: ${code}`);
    return { message: '验证码已发送' };
  }

  async verifyCode(phone: string, _code: string) {
    // TODO: 验证验证码逻辑
    if (_code !== '200501') {
      throw new BadRequestError('验证码错误');
    }
    return { valid: true };
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedError('用户不存在');
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new BadRequestError('原密码错误');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepo.save(user);

    return { message: '密码修改成功' };
  }
}

export const authService = new AuthService();
