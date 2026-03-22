import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { Affiliation, ReadinessStatus } from './create-satellite.dto';

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

  @IsEnum(ReadinessStatus)
  @IsNotEmpty()
  readinessStatus: ReadinessStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
