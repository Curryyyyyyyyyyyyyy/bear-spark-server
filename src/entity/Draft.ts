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

export type DraftType = 'article' | 'news' | 'video';

@Entity('draft')
export class Draft {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'user_id' })
  userId!: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'json', nullable: true })
  data?: Record<string, unknown>;

  @Column({ type: 'varchar', name: 'draft_type', default: 'article' })
  draftType!: DraftType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
