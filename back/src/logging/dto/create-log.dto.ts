import { IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLogDto {
  @IsOptional()
  @IsIn(['error', 'warn', 'info', 'debug'])
  level?: 'error' | 'warn' | 'info' | 'debug';

  @IsString()
  @MaxLength(2000)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  stack?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  component?: string;

  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}
