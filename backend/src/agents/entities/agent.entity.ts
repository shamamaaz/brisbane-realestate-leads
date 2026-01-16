import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  @ManyToOne(() => Agency, (agency) => agency.agents)
  agency: Agency;

  @OneToMany(() => LeadAssignment, (assignment) => assignment.agent)
  assignedLeads: LeadAssignment[];
}
