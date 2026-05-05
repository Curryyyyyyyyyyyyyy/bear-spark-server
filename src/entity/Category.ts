import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'varchar', unique: true, length: 50 })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', name: 'cover_image', length: 500, nullable: true })
  coverImage?: string;

  @Column({ type: 'int', name: 'parent_id', nullable: true })
  parentId?: number;

  @Column({ type: 'int', default: 0 })
  sort!: number;

  @Column({ type: 'int', name: 'article_count', default: 0 })
  articleCount!: number;

  @Column({ type: 'int', name: 'video_count', default: 0 })
  videoCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'parent_id' })
  parent?: Category;
}
