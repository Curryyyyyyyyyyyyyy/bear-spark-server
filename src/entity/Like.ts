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

export type LikeTargetType = 'news' | 'article' | 'video' | 'comment';

@Entity('like')
@Unique(['userId', 'targetType', 'targetId'])
export class Like {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'user_id' })
  userId!: number;

  @Column({ type: 'varchar', name: 'target_type' })
  targetType!: LikeTargetType;

  @Column({ type: 'int', name: 'target_id' })
  targetId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
