import { Global, Module } from '@nestjs/common';
import { AppLogger } from './logger.service';
import { LogsController } from './logs.controller';

@Global()
@Module({
  controllers: [LogsController],
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggingModule {}
