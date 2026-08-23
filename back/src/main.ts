import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { AppLogger } from './logging/logger.service';
import { graylogWinston } from './logging/graylog.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = await app.resolve(AppLogger);
  logger.setContext('Bootstrap');
  app.useLogger(await app.resolve(AppLogger));

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 600,
    }),
  );

  // Access log without personal data: IPs are hashed-free omitted, only technical metadata is sent.
  app.use((req: Request, res: Response, next: () => void) => {
    const startedAt = Date.now();
    res.on('finish', () => {
      graylogWinston.info('HTTP request', {
        context: 'HTTP',
        source: 'backend',
        method: req.method,
        path: req.originalUrl.split('?')[0],
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      });
    });
    next();
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'https://residenz-andreew.zollneck.de',
      'http://85.215.77.161:5173',
      'http://85.215.77.161:5174',
      'http://localhost:5173',
    ],
    methods: 'GET,POST,DELETE,PUT,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  const port = Number(process.env.PORT || 53791);
  await app.listen(port);
  logger.log('Backend gestartet', { event: 'startup', port });
}

bootstrap();
