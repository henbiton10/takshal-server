import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional, ValidateIf } from 'class-validator';
import { Affiliation, ReadinessStatus, FrequencyBand } from './create-satellite.dto';

export class UpdateSatelliteDto {
  @IsString()
  @IsNotEmpty()
  name: string;

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
