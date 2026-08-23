import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  roomId: number;

  @ManyToOne(() => Room, (room) => room.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'varchar', length: 80 })
  firstName: string;

  @Column({ type: 'varchar', length: 80 })
  lastName: string;

  @Column({ type: 'varchar', length: 120 })
  email: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  company: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  vatId: string;

  @Column({ type: 'varchar', length: 300 })
  billingAddress: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: BookingStatus;

  @Column({ type: 'boolean', default: false })
  acceptedAgbs: boolean;

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
