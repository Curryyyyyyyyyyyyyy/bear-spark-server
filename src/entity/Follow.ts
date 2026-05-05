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

@Entity('follow')
@Unique(['followerId', 'followingId'])
export class Follow {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'follower_id' })
  followerId!: number;

  @Column({ type: 'int', name: 'following_id' })
  followingId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'follower_id' })
  follower!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'following_id' })
  following!: User;
}
