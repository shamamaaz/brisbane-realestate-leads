import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Agent } from '../../agents/entities/agent.entity';
import { Territory } from '../../territories/entities/territory.entity';

@Entity()
export class Agency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  primaryColor?: string;

  @Column({ nullable: true })
  secondaryColor?: string;

  @Column({ type: 'text', array: true, nullable: true })
  postcodes?: string[];

  @Column({ default: 'postcode' })
  routingMode: string;

  @Column({ type: 'enum', enum: ['small', 'large'], default: 'small' })
  size: 'small' | 'large';

  @OneToMany(() => Territory, (territory) => territory.agency)
  territories: Territory[];

  @OneToMany(() => Agent, (agent) => agent.agency)
  agents: Agent[];
}
