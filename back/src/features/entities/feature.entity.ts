import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';

@Entity()
export class Feature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  label_de: string;

  @Column({ type: 'varchar', length: 100 })
  label_en: string;

  @Column({ type: 'varchar', length: 60, default: 'pi pi-check' })
  icon: string;

  @ManyToMany(() => Room, (room) => room.features)
  rooms: Room[];
}
