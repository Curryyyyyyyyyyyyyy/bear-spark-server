import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './User.js';
import { Article } from './Article.js';

@Entity('collect')
@Unique(['userId', 'articleId'])
export class Collect {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'user_id' })
  userId!: number;

  @Column({ type: 'int', name: 'article_id' })
  articleId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Article)
  @JoinColumn({ name: 'article_id' })
  article!: Article;
}
