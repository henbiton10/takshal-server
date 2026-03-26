import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  ValidateIf,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
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

export class ConnectivityDto {
  @IsNumber()
  @IsNotEmpty()
  connectedStationId: number;

  @IsString()
  @IsNotEmpty()
  communicationType: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  channelCount: number;
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
  @Type(() => ConnectivityDto)
  @IsOptional()
  connectivities?: ConnectivityDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AntennaDto)
  @IsOptional()
  antennas?: AntennaDto[];
}
