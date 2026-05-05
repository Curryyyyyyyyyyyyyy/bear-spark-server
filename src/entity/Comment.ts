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

export type EntityType = 'article' | 'news' | 'video';

@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'int', name: 'author_id' })
  authorId!: number;

  @Column({ type: 'int', name: 'parent_id', nullable: true })
  parentId?: number;

  @Column({ type: 'varchar', name: 'entity_type' })
  entityType!: EntityType;

  @Column({ type: 'int', name: 'entity_id' })
  entityId!: number;

  @Column({ type: 'int', name: 'like_count', default: 0 })
  likeCount!: number;

  @Column({ type: 'int', name: 'reply_count', default: 0 })
  replyCount!: number;

  @Column({ type: 'json', name: 'at_user_info_list', nullable: true })
  atUserInfoList?: { username: string; userId: number }[];

  @Column({ type: 'int', default: 1 })
  status!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author!: User;
}
