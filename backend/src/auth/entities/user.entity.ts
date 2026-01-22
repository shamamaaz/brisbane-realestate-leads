import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Agency } from '../../agencies/entities/agency.entity';

export enum UserRole {
  SELLER = 'seller',
  HOMEOWNER = 'homeowner',
  AGENT = 'agent',
  AGENCY_ADMIN = 'agency_admin',
  SYSTEM_ADMIN = 'system_admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.SELLER,
  })
  role: UserRole;

  @Column({ nullable: true })
  phone?: string;

  @ManyToOne(() => Agency, { nullable: true })
  agency?: Agency;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
