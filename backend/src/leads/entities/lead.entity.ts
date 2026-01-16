import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Agency } from '../../agencies/entities/agency.entity';
import { Territory } from '../../territories/entities/territory.entity';

@Entity()
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  homeownerName: string;

  @Column()
  homeownerEmail: string;

  @Column({ nullable: true })
  homeownerPhone: string;

  @Column()
  propertyAddress: string;

  @Column({ type: 'decimal', nullable: true })
  estimatedValue: number;

  @Column({ nullable: true })
  preferredContactTime: string; // e.g., "Evenings 5-8pm"

  @ManyToOne(() => Territory, (territory) => territory.id, { nullable: true })
  territory: Territory;

  @ManyToOne(() => Agency, (agency) => agency.id, { nullable: true })
  agency: Agency;

  @CreateDateColumn()
  submittedAt: Date;
}
