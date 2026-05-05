import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vote } from './Vote.js';

@Entity('vote_option')
export class VoteOption {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'vote_id' })
  voteId!: number;

  @Column({ type: 'varchar', name: 'option_content', length: 500 })
  optionContent!: string;

  @Column({ type: 'varchar', name: 'option_photo_url', length: 500, nullable: true })
  optionPhotoUrl?: string;

  @Column({ type: 'int', name: 'vote_count', default: 0 })
  voteCount!: number;

  @ManyToOne(() => Vote, (vote) => vote.options)
  @JoinColumn({ name: 'vote_id' })
  vote!: Vote;
}
