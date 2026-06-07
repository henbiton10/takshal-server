import {
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
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

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  tailNumbers?: number[] | null;

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
