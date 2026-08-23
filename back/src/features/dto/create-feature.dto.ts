import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFeatureDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label_de: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label_en: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  icon?: string;
}
