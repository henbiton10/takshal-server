import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  ValidateIf,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrganizationalAffiliation, ReadinessStatus, ConnectivityDto, AntennaDto } from './create-station.dto';

export class UpdateStationDto {
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
