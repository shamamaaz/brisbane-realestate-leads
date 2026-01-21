import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Lead } from '../../leads/entities/lead.entity';

@Entity()
export class AgentOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Lead, (lead) => lead.offers, { onDelete: 'CASCADE' })
  lead: Lead;

  @Column()
  agentName: string;

  @Column({ nullable: true })
  agentEmail?: string;

  @Column({ nullable: true })
  agencyName?: string;

  @Column({ type: 'decimal', nullable: true })
  priceMin?: number;

  @Column({ type: 'decimal', nullable: true })
  priceMax?: number;

  @Column({ type: 'decimal', nullable: true })
  commissionPercent?: number;

  @Column({ type: 'int', nullable: true })
  estimatedDays?: number;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @CreateDateColumn()
  createdAt: Date;
}
