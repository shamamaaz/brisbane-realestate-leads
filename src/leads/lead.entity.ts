import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  suburb: string;

  @Column({ nullable: true })
  propertyValue: number;

  @CreateDateColumn()
  createdAt: Date;
}
