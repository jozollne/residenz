import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../rooms/entities/room.entity';
import { Feature } from '../features/entities/feature.entity';
import { AppLogger } from '../logging/logger.service';

const FEATURES = [
  { label_de: 'WLAN', label_en: 'Wi-Fi', icon: 'pi pi-wifi' },
  { label_de: 'Schreibtisch', label_en: 'Desk', icon: 'pi pi-briefcase' },
  { label_de: 'Gemeinschaftsküche', label_en: 'Shared kitchen', icon: 'pi pi-shopping-bag' },
  { label_de: 'Gemeinschaftsbad', label_en: 'Shared bathroom', icon: 'pi pi-inbox' },
  { label_de: 'Bettwäsche inklusive', label_en: 'Linens included', icon: 'pi pi-star' },
  { label_de: 'Ruhige Lage', label_en: 'Quiet location', icon: 'pi pi-sun' },
  { label_de: 'Parkplatz', label_en: 'Parking', icon: 'pi pi-car' },
  { label_de: 'Nichtraucher', label_en: 'Non-smoking', icon: 'pi pi-ban' },
];

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Room) private roomRepository: Repository<Room>,
    @InjectRepository(Feature) private featureRepository: Repository<Feature>,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('SeedService');
  }

  async onApplicationBootstrap(): Promise<void> {
    let features = await this.featureRepository.find();
    if (features.length === 0) {
      features = await this.featureRepository.save(
        FEATURES.map((feature) => this.featureRepository.create(feature)),
      );
      this.logger.log('Basis-Features angelegt', { event: 'seed_features', count: features.length });
    }

    if ((await this.roomRepository.count()) > 0) return;

    const byLabel = (label: string) => features.find((f) => f.label_de === label);
    const base = [
      byLabel('WLAN'),
      byLabel('Gemeinschaftsküche'),
      byLabel('Gemeinschaftsbad'),
      byLabel('Nichtraucher'),
    ].filter(Boolean);

    const rooms = [
      this.roomRepository.create({
        name: 'Zimmer Rosengarten',
        description:
          'Helles Zimmer mit Blick in den Garten, edel möbliert und ideal für längere Aufenthalte.',
        description_en:
          'Bright room overlooking the garden, elegantly furnished and ideal for longer stays.',
        price: 59.0,
        isActive: true,
        isUnderConstruction: false,
        minStay: 2,
        images: ['/media/ZimmerRosengarten.jpg'],
        features: [...base, byLabel('Schreibtisch'), byLabel('Ruhige Lage')].filter(Boolean),
      }),
      this.roomRepository.create({
        name: 'Zimmer Lindenblick',
        description:
          'Gemütliches Zimmer im ersten Obergeschoss mit Schreibtisch und ruhiger Atmosphäre.',
        description_en: 'Cosy room on the first floor with a desk and a calm atmosphere.',
        price: 49.0,
        isActive: true,
        isUnderConstruction: false,
        minStay: 1,
        images: ['/media/ZimmerLindenblick.jpg'],
        features: [...base, byLabel('Bettwäsche inklusive'), byLabel('Parkplatz')].filter(Boolean),
      }),
      this.roomRepository.create({
        name: 'Suite Andreew',
        description: 'Große Suite – befindet sich derzeit noch in der Renovierung.',
        description_en: 'Spacious suite – currently still being renovated.',
        price: 89.0,
        isActive: true,
        isUnderConstruction: true,
        minStay: 3,
        images: ['/media/SuiteAndreew.jpg'],
        features: [...base, byLabel('Ruhige Lage')].filter(Boolean),
      }),
    ];

    await this.roomRepository.save(rooms);
    this.logger.log('Beispiel-Zimmer angelegt', { event: 'seed_rooms', count: rooms.length });
  }
}
