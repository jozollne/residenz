import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import { graylogWinston } from './graylog.logger';

const SENSITIVE_KEYS = [
  'password',
  'passwort',
  'pass',
  'token',
  'authorization',
  'jwt',
  'secret',
  'vatid',
  'billingaddress',
  'email',
  'firstname',
  'lastname',
];

/**
 * Removes or masks personal / secret values before anything leaves the process (DSGVO).
 */
export function sanitize(value: any, depth = 0): any {
  if (value === null || value === undefined || depth > 5) return value;
  if (Array.isArray(value)) return value.map((item) => sanitize(item, depth + 1));
  if (typeof value !== 'object') return value;

  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(value)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      result[key] = '[redacted]';
    } else {
      result[key] = sanitize(val, depth + 1);
    }
  }
  return result;
}

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements NestLoggerService {
  private context = 'App';

  setContext(context: string): void {
    this.context = context;
  }

  log(message: any, meta: Record<string, any> = {}): void {
    graylogWinston.info(String(message), { context: this.context, ...sanitize(meta) });
  }

  warn(message: any, meta: Record<string, any> = {}): void {
    graylogWinston.warn(String(message), { context: this.context, ...sanitize(meta) });
  }

  error(message: any, stack?: string, meta: Record<string, any> = {}): void {
    graylogWinston.error(String(message), { context: this.context, stack, ...sanitize(meta) });
  }

  debug(message: any, meta: Record<string, any> = {}): void {
    graylogWinston.debug(String(message), { context: this.context, ...sanitize(meta) });
  }

  verbose(message: any, meta: Record<string, any> = {}): void {
    graylogWinston.verbose(String(message), { context: this.context, ...sanitize(meta) });
  }
}
