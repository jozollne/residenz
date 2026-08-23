import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggingModule } from './logging/logging.module';
import { AuthModule } from './auth/auth.module';
import { RoomsModule } from './rooms/rooms.module';
import { FeaturesModule } from './features/features.module';
import { BookingsModule } from './bookings/bookings.module';
import { SeedModule } from './seed/seed.module';
import { Users } from './auth/entities/users.entity';
import { Room } from './rooms/entities/room.entity';
import { Feature } from './features/entities/feature.entity';
import { Booking } from './bookings/entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      schema: process.env.DB_SCHEMA || 'public',
      entities: [Users, Room, Feature, Booking],
      synchronize: true,
    }),
    LoggingModule,
    AuthModule,
    RoomsModule,
    FeaturesModule,
    BookingsModule,
    SeedModule,
  ],
})
export class AppModule {}
