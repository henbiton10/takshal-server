import {
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateAllocationDto {
  @IsNumber()
  @IsOptional()
  parentAllocationId?: number | null;

  @IsNumber()
  terminalId: number;

  @IsNumber()
  transmissionSatelliteId: number;

  @IsNumber()
  transmissionAntennaId: number;

  @IsNumber()
  @Min(0.01)
  transmissionFrequency: number;

  @IsNumber()
  receptionSatelliteId: number;

  @IsNumber()
  receptionAntennaId: number;

  @IsNumber()
  @Min(0.01)
  receptionFrequency: number;

  @IsNumber()
  @IsOptional()
  transmissionConnectivityId?: number | null;

  @IsNumber()
  @IsOptional()
  receptionConnectivityId?: number | null;

  @IsNumber()
  @IsOptional()
  transmissionChannelNumber?: number | null;

  @IsNumber()
  @IsOptional()
  receptionChannelNumber?: number | null;

  @IsNumber()
  @IsOptional()
  tailNumber?: number | null;

  @IsString()
  @IsOptional()
  notes?: string | null;

  @IsBoolean()
  @IsOptional()
  hasConflict?: boolean;

  @IsBoolean()
  @IsOptional()
  conflictIgnored?: boolean;
}
