import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Agency } from '../../agencies/entities/agency.entity';
import { LeadAssignment } from '../../lead-assignments/entities/lead-assignment.entity';

@Entity()
export class Agent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  territory?: string;

  @Column({ default: 'agent' })
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  leadsAssigned?: number;

  @Column({ nullable: true })
  agencyId?: number;

  @Column({ nullable: true })
  userId?: number;

  @ManyToOne(() => Agency, (agency) => agency.agents)
  @JoinColumn({ name: 'agencyId' })
  agency: Agency;

  @OneToMany(() => LeadAssignment, (assignment) => assignment.agent)
  assignedLeads: LeadAssignment[];
}
