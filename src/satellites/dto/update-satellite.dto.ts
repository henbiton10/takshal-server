import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsArray } from 'class-validator';
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

  @IsEnum(FrequencyBand)
  @IsNotEmpty()
  frequencyBand: FrequencyBand;

  @IsEnum(ReadinessStatus)
  @IsNotEmpty()
  readinessStatus: ReadinessStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
