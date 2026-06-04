import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional, ValidateIf, IsNumber, IsArray } from 'class-validator';
import { Affiliation, ReadinessStatus, FrequencyBand } from './create-satellite.dto';

export class UpdateSatelliteDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  displayName?: string | null;

  @IsString()
  @IsOptional()
  skyPoint?: string | null;

  @IsNumber()
  @IsNotEmpty()
  bandwidth: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  screenshots?: string[] | null;

  @IsEnum(Affiliation)
  @IsNotEmpty()
  affiliation: Affiliation;

  @IsBoolean()
  @IsNotEmpty()
  hasFrequencyConverter: boolean;

  @ValidateIf((o) => o.frequencyBand !== null)
  @IsEnum(FrequencyBand)
  @IsOptional()
  frequencyBand?: FrequencyBand | null;

  @IsEnum(ReadinessStatus)
  @IsNotEmpty()
  readinessStatus: ReadinessStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
