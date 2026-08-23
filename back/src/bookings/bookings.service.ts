import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { Room } from '../rooms/entities/room.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { AppLogger } from '../logging/logger.service';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    @InjectRepository(Room) private roomRepository: Repository<Room>,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('BookingsService');
  }

  findAll(): Promise<Booking[]> {
    return this.bookingRepository.find({ relations: { room: true }, order: { startDate: 'DESC' } });
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: { room: true },
    });
    if (!booking) {
      throw new HttpException('Buchung nicht gefunden', HttpStatus.NOT_FOUND);
    }
    return booking;
  }

  /** Public availability view: only date ranges, no guest data. */
  async findOccupiedRanges(roomId: number): Promise<{ startDate: string; endDate: string }[]> {
    const bookings = await this.bookingRepository.find({
      where: { roomId, status: Not('cancelled' as any) },
      select: { startDate: true, endDate: true },
      order: { startDate: 'ASC' },
    });
    return bookings.map(({ startDate, endDate }) => ({ startDate, endDate }));
  }

  private async assertAvailable(
    roomId: number,
    startDate: string,
    endDate: string,
    ignoreBookingId?: number,
  ): Promise<void> {
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.roomId = :roomId', { roomId })
      .andWhere('booking.status != :cancelled', { cancelled: 'cancelled' })
      .andWhere('booking.startDate < :endDate AND booking.endDate > :startDate', {
        startDate,
        endDate,
      });

    if (ignoreBookingId) {
      query.andWhere('booking.id != :ignoreBookingId', { ignoreBookingId });
    }

    if (await query.getExists()) {
      throw new HttpException('Der gewählte Zeitraum ist bereits belegt', HttpStatus.CONFLICT);
    }
  }

  private validateRange(startDate: string, endDate: string, minStay: number): void {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      throw new HttpException('Ungültiger Zeitraum', HttpStatus.BAD_REQUEST);
    }

    const nights = Math.round((end.getTime() - start.getTime()) / DAY_MS);
    if (nights < minStay) {
      throw new HttpException(
        `Die Mindestaufenthaltsdauer beträgt ${minStay} Nächte`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async create(dto: CreateBookingDto): Promise<Booking> {
    if (!dto.acceptedAgbs) {
      throw new HttpException('Die AGB müssen akzeptiert werden', HttpStatus.BAD_REQUEST);
    }

    const room = await this.roomRepository.findOne({ where: { id: dto.roomId } });
    if (!room) {
      throw new HttpException('Zimmer nicht gefunden', HttpStatus.NOT_FOUND);
    }
    if (!room.isActive || room.isUnderConstruction) {
      throw new HttpException('Dieses Zimmer ist derzeit nicht buchbar', HttpStatus.BAD_REQUEST);
    }

    this.validateRange(dto.startDate, dto.endDate, room.minStay);
    await this.assertAvailable(dto.roomId, dto.startDate, dto.endDate);

    const booking = this.bookingRepository.create({ ...dto, status: 'pending' });
    const saved = await this.bookingRepository.save(booking);

    this.logger.log('Buchungsanfrage eingegangen', {
      event: 'booking_created',
      bookingId: saved.id,
      roomId: saved.roomId,
    });

    return saved;
  }

  async update(id: number, dto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);
    const startDate = dto.startDate ?? booking.startDate;
    const endDate = dto.endDate ?? booking.endDate;
    const roomId = dto.roomId ?? booking.roomId;

    if (dto.startDate || dto.endDate || dto.roomId) {
      const room = await this.roomRepository.findOne({ where: { id: roomId } });
      if (!room) {
        throw new HttpException('Zimmer nicht gefunden', HttpStatus.NOT_FOUND);
      }
      this.validateRange(startDate, endDate, room.minStay);
      await this.assertAvailable(roomId, startDate, endDate, id);
    }

    Object.assign(booking, dto);
    const saved = await this.bookingRepository.save(booking);

    this.logger.log('Buchung aktualisiert', {
      event: 'booking_updated',
      bookingId: id,
      status: saved.status,
    });

    return saved;
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const booking = await this.findOne(id);
    await this.bookingRepository.remove(booking);
    this.logger.log('Buchung gelöscht', { event: 'booking_deleted', bookingId: id });
    return { deleted: true };
  }
}
