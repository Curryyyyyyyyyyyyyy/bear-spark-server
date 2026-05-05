import type { Request } from 'koa';

export interface IUser {
  id: number;
  username: string;
  email: string;
  password?: string;
  nickname?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IArticle {
  id: number;
  title: string;
  content: string;
  summary?: string;
  coverImage?: string;
  authorId: number;
  categoryId?: number;
  tags?: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface INews {
  id: number;
  title: string;
  content: string;
  summary?: string;
  coverImage?: string;
  authorId: number;
  categoryId?: number;
  source?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVideo {
  id: number;
  title: string;
  description?: string;
  url: string;
  coverImage?: string;
  authorId: number;
  categoryId?: number;
  duration?: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  status: 'uploading' | 'processing' | 'published' | 'failed';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  id: number;
  content: string;
  authorId: number;
  parentId?: number;
  entityType: 'article' | 'news' | 'video';
  entityId: number;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  sort: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  userId: number;
  phone: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
