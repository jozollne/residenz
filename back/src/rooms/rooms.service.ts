import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { Feature } from '../features/entities/feature.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AppLogger } from '../logging/logger.service';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room) private roomRepository: Repository<Room>,
    @InjectRepository(Feature) private featureRepository: Repository<Feature>,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('RoomsService');
  }

  findAll(onlyActive = false): Promise<Room[]> {
    return this.roomRepository.find({
      where: onlyActive ? { isActive: true } : {},
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) {
      throw new HttpException('Zimmer nicht gefunden', HttpStatus.NOT_FOUND);
    }
    return room;
  }

  private async resolveFeatures(featureIds?: number[]): Promise<Feature[] | undefined> {
    if (!featureIds) return undefined;
    if (featureIds.length === 0) return [];
    return this.featureRepository.find({ where: { id: In(featureIds) } });
  }

  async create(dto: CreateRoomDto): Promise<Room> {
    const room = this.roomRepository.create({
      name: dto.name,
      description: dto.description,
      description_en: dto.description_en,
      price: dto.price,
      isActive: dto.isActive ?? true,
      isUnderConstruction: dto.isUnderConstruction ?? false,
      minStay: dto.minStay ?? 1,
      images: dto.images ?? [],
      features: (await this.resolveFeatures(dto.featureIds)) ?? [],
    });
    const saved = await this.roomRepository.save(room);
    this.logger.log('Zimmer angelegt', { event: 'room_created', roomId: saved.id });
    return saved;
  }

  async update(id: number, dto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);
    const { featureIds, ...rest } = dto;
    Object.assign(room, rest);

    const features = await this.resolveFeatures(featureIds);
    if (features) {
      room.features = features;
    }

    const saved = await this.roomRepository.save(room);
    this.logger.log('Zimmer aktualisiert', { event: 'room_updated', roomId: id });
    return saved;
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const room = await this.findOne(id);
    await this.roomRepository.remove(room);
    this.logger.log('Zimmer gelöscht', { event: 'room_deleted', roomId: id });
    return { deleted: true };
  }
}
