import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum FrequencyBand {
  KA = 'ka',
  KU = 'ku',
  CB = 'cb',
}

export enum ReadinessStatus {
  READY = 'ready',
  PARTLY_READY = 'partly_ready',
  DAMAGED = 'damaged',
}

export class TerminalConnectivityDto {
  // --- Terminal side ---
  @IsNumber()
  @IsOptional()
  stationId?: number | null;

  @IsNumber()
  @IsOptional()
  antennaId?: number | null;

  @IsString()
  @IsOptional()
  connectionType?: string | null;

  @IsString()
  @IsOptional()
  transitNetwork?: string | null;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  cratosNumber?: number | null;

  // --- Antenna side (optional) ---
  @IsNumber()
  @IsOptional()
  antennaSideStationId?: number | null;

  @IsNumber()
  @IsOptional()
  antennaSideAntennaId?: number | null;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  antennaSideCratosNumber?: number | null;
}

export class CreateTerminalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsOptional()
  stationId?: number | null;

  @IsNumber()
  @IsOptional()
  secondStationId?: number | null;

  @IsNumber()
  @IsNotEmpty()
  bandwidth: number;

  @IsNumber()
  @IsOptional()
  satelliteId?: number | null;

  @IsEnum(FrequencyBand)
  @IsNotEmpty()
  frequencyBand: FrequencyBand;

  @IsString()
  @IsNotEmpty()
  terminalType: string;

  @IsEnum(ReadinessStatus)
  @IsNotEmpty()
  readinessStatus: ReadinessStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TerminalConnectivityDto)
  @IsOptional()
  connectivities?: TerminalConnectivityDto[];
}
