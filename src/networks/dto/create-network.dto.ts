import { IsString, IsNotEmpty, IsEnum, IsOptional, ValidateIf, IsNumber } from 'class-validator';

export enum ReadinessStatus {
  READY = 'ready',
  PARTLY_READY = 'partly_ready',
  DAMAGED = 'damaged',
}

export class CreateNetworkDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  terminalTypeId: number;

  @IsNumber()
  @IsNotEmpty()
  connectivityTypeId: number;

  @IsEnum(ReadinessStatus)
  @IsNotEmpty()
  readinessStatus: ReadinessStatus;

  @ValidateIf((o) => o.readinessStatus !== ReadinessStatus.READY)
  @IsString()
  @IsNotEmpty({ message: 'הערות הינן שדה חובה כאשר סטטוס הכשירות אינו "כשיר"' })
  @IsOptional()
  notes?: string;
}
