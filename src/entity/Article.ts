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
import { Category } from './Category.js';

@Entity('article')
export class Article {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ type: 'varchar', name: 'cover_image', length: 500, nullable: true })
  coverImage?: string;

  @Column({ type: 'int', name: 'author_id' })
  authorId!: number;

  @Column({ type: 'int', name: 'category_id', nullable: true })
  categoryId?: number;

  @Column({ type: 'json', nullable: true })
  tags?: string[];

  @Column({ type: 'int', name: 'view_count', default: 0 })
  viewCount!: number;

  @Column({ type: 'int', name: 'like_count', default: 0 })
  likeCount!: number;

  @Column({ type: 'int', name: 'collect_count', default: 0 })
  collectCount!: number;

  @Column({ type: 'int', name: 'comment_count', default: 0 })
  commentCount!: number;

  @Column({ type: 'int', name: 'merit_count', default: 0 })
  meritCount!: number;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'reprint_article_url' })
  reprintArticleUrl?: string;

  @Column({ type: 'int', default: 1 })
  visibility!: number;

  @Column({ type: 'int', name: 'comment_able', default: 1 })
  commentAble!: number;

  @Column({ type: 'int', default: 0 })
  declaration!: number;

  @Column({ type: 'varchar', length: 20, default: 'published' })
  status!: 'draft' | 'published' | 'archived';

  @Column({ type: 'datetime', name: 'published_at', nullable: true })
  publishedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.articles)
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category?: Category;
}
