import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Feature } from '../../features/entities/feature.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  description_en: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isUnderConstruction: boolean;

  @Column({ type: 'int', default: 1 })
  minStay: number;

  @Column({ type: 'text', array: true, default: '{}' })
  images: string[];

  @ManyToMany(() => Feature, (feature) => feature.rooms, { eager: true })
  @JoinTable({
    name: 'room_feature',
    joinColumn: { name: 'roomId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'featureId', referencedColumnName: 'id' },
  })
  features: Feature[];

  @OneToMany(() => Booking, (booking) => booking.room)
  bookings: Booking[];
}
