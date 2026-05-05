import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tag')
export class Tag {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true, length: 50 })
  name!: string;

  @Column({ type: 'int', name: 'use_count', default: 0 })
  useCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
