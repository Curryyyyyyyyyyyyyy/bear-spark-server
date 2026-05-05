import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Article } from './Article.js';
import { News } from './News.js';
import { Video } from './Video.js';
import { Comment } from './Comment.js';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true, length: 11 })
  phone!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', name: 'nickname', length: 50, nullable: true})
  nickname?: string;

  @Column({ type: 'varchar', name: 'avatar', length: 500, nullable: true, default: 'https://github.githubassets.com/assets/mona-loading-default-c3c7aad1282f.gif' })
  avatar?: string;

  @Column({ type: 'varchar', name: 'bio', length: 500, nullable: true, default: '' })
  bio?: string;

  @Column({ type: 'int', name: 'follower_count', default: 0 })
  followerCount!: number;

  @Column({ type: 'int', name: 'following_count', default: 0 })
  followingCount!: number;

  @Column({ type: 'int', name: 'article_count', default: 0 })
  articleCount!: number;

  @Column({ type: 'int', name: 'video_count', default: 0 })
  videoCount!: number;

  @Column({ type: 'int', name: 'merit_count', default: 0 })
  meritCount!: number;

  @Column({ type: 'int', name: 'coin_count', default: 0 })
  coinCount!: number;

  @Column({ type: 'int', default: 1 })
  status!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Article, (article) => article.author)
  articles!: Article[];

  @OneToMany(() => News, (news) => news.author)
  newsList!: News[];

  @OneToMany(() => Video, (video) => video.author)
  videos!: Video[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments!: Comment[];
}
