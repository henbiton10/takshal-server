import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  ValidateIf,
  IsArray,
  ValidateNested,
  IsNumber,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum OrganizationalAffiliation {
  AIRFORCE = 'airforce',
  TIKSHUV = 'tikshuv',
}

export enum ReadinessStatus {
  READY = 'ready',
  PARTLY_READY = 'partly_ready',
  DAMAGED = 'damaged',
}

export class AntennaDto {
  @IsNumber()
  @Min(0.1)
  @IsNotEmpty()
  size: number;

  @IsString()
  @IsNotEmpty()
  frequencyBand: string;
}

export class CratosDto {
  @IsInt()
  @Min(1)
  @Max(10)
  @IsNotEmpty()
  number: number;
}

export class CreateStationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(OrganizationalAffiliation)
  @IsNotEmpty()
  organizationalAffiliation: OrganizationalAffiliation;

  @IsEnum(ReadinessStatus)
  @IsNotEmpty()
  readinessStatus: ReadinessStatus;

  @ValidateIf((o) => o.readinessStatus !== ReadinessStatus.READY)
  @IsString()
  @IsNotEmpty({ message: 'הערות הינן שדה חובה כאשר סטטוס הכשירות אינו "כשיר"' })
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AntennaDto)
  @IsOptional()
  antennas?: AntennaDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CratosDto)
  @IsOptional()
  cratoses?: CratosDto[];
}
