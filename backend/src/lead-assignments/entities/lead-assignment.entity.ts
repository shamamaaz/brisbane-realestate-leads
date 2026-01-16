import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Agent } from '../../agents/entities/agent.entity';
import { Lead } from '../../leads/entities/lead.entity';

export enum AssignmentStatus {
  PENDING = 'pending',
  CONTACTED = 'contacted',
  CLOSED = 'closed',
  LOST = 'lost',
}

@Entity()
export class LeadAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Lead, (lead) => lead.id)
  lead: Lead;

  @ManyToOne(() => Agent, (agent) => agent.assignedLeads)
  agent: Agent;

  @Column({ type: 'enum', enum: AssignmentStatus, default: AssignmentStatus.PENDING })
  status: AssignmentStatus;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  assignedAt: Date;
}
