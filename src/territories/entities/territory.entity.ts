import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Agency } from '../../agencies/entities/agency.entity';

@Entity()
export class Territory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // e.g., Moorooka

  @Column('text', { array: true })
  suburbs: string[];

  @ManyToOne(() => Agency, (agency) => agency.territories)
  agency: Agency;
}
