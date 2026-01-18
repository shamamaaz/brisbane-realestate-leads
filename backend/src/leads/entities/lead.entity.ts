import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
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

  @Column()
  homeownerPhone: string;

  @Column()
  propertyAddress: string;

  @Column({ nullable: true })
  propertyType: string; // house, apartment, unit, etc.

  @Column({ nullable: true })
  preferredAgency?: string;

  @Column({ nullable: true })
  preferredContactTime: string; // e.g., "Evenings 5-8pm"

  @Column({ default: 'New' })
  status: string; // New, Contacted, Scheduled, Closed

  @Column({ type: 'decimal', nullable: true })
  estimatedValue: number;

  @Column({ type: 'text', nullable: true })
  notes: string; // Internal notes about the lead

  @Column({ type: 'simple-array', nullable: true })
  callHistory: string[]; // Array of call timestamps and notes

  @Column({ nullable: true })
  nextFollowUpDate: Date; // Scheduled follow-up date

  @Column({ nullable: true })
  lastContactedDate: Date; // When the lead was last contacted

  @Column({ nullable: true })
  assignedAgentName: string; // Name of assigned agent

  @ManyToOne(() => Territory, (territory) => territory.id, { nullable: true })
  territory: Territory;

  @ManyToOne(() => Agency, (agency) => agency.id, { nullable: true })
  agency: Agency;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
