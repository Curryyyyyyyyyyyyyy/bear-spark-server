import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User.js';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title?: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  summary?: string;

  @Column({ type: 'varchar', name: 'cover_image', length: 500, nullable: true })
  coverImage?: string;

  @Column({ type: 'int', name: 'author_id' })
  authorId!: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  source?: string;

  @Column({ type: 'json', name: 'img_url_list', nullable: true })
  imgUrlList?: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  tag?: string;

  @Column({ type: 'json', name: 'at_user_info_list', nullable: true })
  atUserInfoList?: { atUsername: string; atUserId: number }[];

  @Column({ type: 'int', name: 'quoted_happening_id', nullable: true })
  quotedHappeningId?: number;

  @Column({ type: 'json', name: 'quoted_happening', nullable: true })
  quotedHappening?: Record<string, unknown>;

  @Column({ type: 'json', name: 'article_info', nullable: true })
  articleInfo?: { articleId: number; title: string; summary: string };

  @Column({ type: 'int', name: 'view_count', default: 0 })
  viewCount!: number;

  @Column({ type: 'int', name: 'like_count', default: 0 })
  likeCount!: number;

  @Column({ type: 'int', name: 'comment_count', default: 0 })
  commentCount!: number;

  @Column({ type: 'int', name: 'forward_count', default: 0 })
  forwardCount!: number;

  @Column({ type: 'int', name: 'comment_able', default: 1 })
  commentAble!: number;

  @Column({ type: 'int', name: 'advance_release', default: 0 })
  advanceRelease!: number;

  @Column({ type: 'int', name: 'vote_id', nullable: true })
  voteId?: number;

  @Column({ type: 'json', name: 'vote_info', nullable: true })
  voteInfo?: Record<string, unknown>;

  @Column({ type: 'varchar', length: 20, default: 'published' })
  status!: 'draft' | 'published' | 'archived';

  @Column({ type: 'datetime', name: 'published_at', nullable: true })
  publishedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.newsList)
  @JoinColumn({ name: 'author_id' })
  author!: User;
}
