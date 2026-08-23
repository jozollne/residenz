import * as winston from 'winston';
import Transport = require('winston-transport');
import * as dgram from 'dgram';
import * as zlib from 'zlib';

const APP_NAME = process.env.APP_NAME || 'residenz-andreew';
const ENVIRONMENT = process.env.NODE_ENV || 'production';
const GRAYLOG_HOST = process.env.GRAYLOG_HOST || '127.0.0.1';
const GRAYLOG_PORT = Number(process.env.GRAYLOG_PORT || 12201);

const LEVEL_TO_SYSLOG: Record<string, number> = {
  error: 3,
  warn: 4,
  info: 6,
  http: 6,
  verbose: 7,
  debug: 7,
  silly: 7,
};

// GELF chunking limit for UDP; larger messages are split into 8-byte-header chunks.
const MAX_CHUNK_SIZE = 1420;

class GelfUdpTransport extends Transport {
  private readonly socket = dgram.createSocket('udp4');

  constructor(opts?: Transport.TransportStreamOptions) {
    super(opts);
    this.socket.unref();
    this.socket.on('error', () => undefined);
  }

  log(info: any, callback: () => void): void {
    setImmediate(() => this.emit('logged', info));

    const { level, message, context, stack, ...meta } = info;
    const gelf: Record<string, any> = {
      version: '1.1',
      host: APP_NAME,
      short_message: typeof message === 'string' ? message : JSON.stringify(message),
      timestamp: Date.now() / 1000,
      level: LEVEL_TO_SYSLOG[level] ?? 6,
      _app: APP_NAME,
      _environment: ENVIRONMENT,
    };

    if (stack) {
      gelf.full_message = String(stack);
    }
    if (context) {
      gelf._context = String(context);
    }

    for (const [key, value] of Object.entries(meta)) {
      if (value === undefined || key === 'splat' || key === Symbol.for('level').toString()) continue;
      gelf[`_${key}`] = typeof value === 'object' ? JSON.stringify(value) : value;
    }

    this.send(Buffer.from(JSON.stringify(gelf), 'utf8'));
    callback();
  }

  private send(payload: Buffer): void {
    const compressed = zlib.gzipSync(payload);

    if (compressed.length <= MAX_CHUNK_SIZE) {
      this.socket.send(compressed, GRAYLOG_PORT, GRAYLOG_HOST, () => undefined);
      return;
    }

    const total = Math.ceil(compressed.length / MAX_CHUNK_SIZE);
    if (total > 128) return;

    const messageId = Buffer.alloc(8);
    messageId.writeUInt32BE(Math.floor(Math.random() * 0xffffffff), 0);
    messageId.writeUInt32BE(Date.now() % 0xffffffff, 4);

    for (let i = 0; i < total; i++) {
      const header = Buffer.concat([
        Buffer.from([0x1e, 0x0f]),
        messageId,
        Buffer.from([i, total]),
      ]);
      const body = compressed.subarray(i * MAX_CHUNK_SIZE, (i + 1) * MAX_CHUNK_SIZE);
      this.socket.send(Buffer.concat([header, body]), GRAYLOG_PORT, GRAYLOG_HOST, () => undefined);
    }
  }
}

export const graylogWinston = winston.createLogger({
  level: 'debug',
  defaultMeta: { app: APP_NAME, environment: ENVIRONMENT },
  transports: [new GelfUdpTransport()],
});
