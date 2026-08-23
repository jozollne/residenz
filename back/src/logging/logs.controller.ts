import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { graylogWinston } from './graylog.logger';
import { sanitize } from './logger.service';
import { CreateLogDto } from './dto/create-log.dto';

@Controller('logs')
export class LogsController {
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  create(@Body() dto: CreateLogDto) {
    const level = dto.level || 'error';
    graylogWinston.log(level, dto.message, {
      source: 'frontend',
      app: process.env.APP_NAME || 'residenz-andreew',
      environment: process.env.NODE_ENV || 'production',
      context: dto.component || 'frontend',
      stack: dto.stack,
      url: dto.url,
      ...sanitize(dto.meta || {}),
    });

    return { accepted: true };
  }
}
