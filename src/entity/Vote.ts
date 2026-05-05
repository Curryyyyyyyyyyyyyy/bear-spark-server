import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { VoteOption } from './VoteOption.js';

@Entity('vote')
export class Vote {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', name: 'news_id', nullable: true })
  newsId?: number;

  @Column({ type: 'int', name: 'author_id' })
  authorId!: number;

  @Column({ type: 'int', default: 1, name: 'vote_type' })
  voteType!: number;

  @Column({ type: 'int', default: 1, name: 'vote_limit' })
  voteLimit!: number;

  @Column({ type: 'datetime', nullable: true })
  deadline?: Date;

  @Column({ type: 'int', name: 'vote_num_info', default: 0 })
  totalCount!: number;

  @Column({ type: 'int', default: 0 })
  status!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => VoteOption, (option) => option.vote)
  options!: VoteOption[];
}
