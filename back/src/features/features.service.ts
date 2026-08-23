import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feature } from './entities/feature.entity';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { AppLogger } from '../logging/logger.service';

@Injectable()
export class FeaturesService {
  constructor(
    @InjectRepository(Feature) private featureRepository: Repository<Feature>,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('FeaturesService');
  }

  findAll(): Promise<Feature[]> {
    return this.featureRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Feature> {
    const feature = await this.featureRepository.findOne({ where: { id } });
    if (!feature) {
      throw new HttpException('Ausstattungsmerkmal nicht gefunden', HttpStatus.NOT_FOUND);
    }
    return feature;
  }

  async create(dto: CreateFeatureDto): Promise<Feature> {
    const feature = this.featureRepository.create({
      label_de: dto.label_de,
      label_en: dto.label_en,
      icon: dto.icon || 'pi pi-check',
    });
    const saved = await this.featureRepository.save(feature);
    this.logger.log('Feature angelegt', { event: 'feature_created', featureId: saved.id });
    return saved;
  }

  async update(id: number, dto: UpdateFeatureDto): Promise<Feature> {
    const feature = await this.findOne(id);
    Object.assign(feature, dto);
    const saved = await this.featureRepository.save(feature);
    this.logger.log('Feature aktualisiert', { event: 'feature_updated', featureId: id });
    return saved;
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const feature = await this.findOne(id);
    await this.featureRepository.remove(feature);
    this.logger.log('Feature gelöscht', { event: 'feature_deleted', featureId: id });
    return { deleted: true };
  }
}
