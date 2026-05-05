import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Vote } from './Vote.js';
import { VoteOption } from './VoteOption.js';
import { User } from './User.js';

@Entity('vote_record')
@Unique(['userId', 'optionId'])
export class VoteRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'user_id' })
  userId!: number;

  @Column({ type: 'int', name: 'vote_id' })
  voteId!: number;

  @Column({ type: 'int', name: 'option_id' })
  optionId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Vote)
  @JoinColumn({ name: 'vote_id' })
  vote!: Vote;

  @ManyToOne(() => VoteOption)
  @JoinColumn({ name: 'option_id' })
  option!: VoteOption;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
