import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';

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

export class CreateTerminalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  stationId: number;

  @IsNumber()
  @IsOptional()
  secondStationId?: number | null;

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
}
