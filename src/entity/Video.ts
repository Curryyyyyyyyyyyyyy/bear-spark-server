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

@Entity('video')
export class Video {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 500 })
  url!: string;

  @Column({ type: 'varchar', name: 'cover_image', length: 500, nullable: true })
  coverImage?: string;

  @Column({ type: 'int', name: 'author_id' })
  authorId!: number;

  @Column({ type: 'int', name: 'category_id', nullable: true })
  categoryId?: number;

  @Column({ type: 'int', nullable: true })
  duration?: number;

  @Column({ type: 'int', name: 'view_count', default: 0 })
  viewCount!: number;

  @Column({ type: 'int', name: 'like_count', default: 0 })
  likeCount!: number;

  @Column({ type: 'int', name: 'comment_count', default: 0 })
  commentCount!: number;

  @Column({ type: 'int', default: 1, name: 'comment_able' })
  commentAble!: number;

  @Column({ type: 'varchar', length: 20, default: 'published' })
  status!: 'uploading' | 'processing' | 'published' | 'failed';

  @Column({ type: 'datetime', name: 'published_at', nullable: true })
  publishedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.videos)
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category?: Category;
}
