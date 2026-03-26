import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { FrequencyBand, ReadinessStatus } from './create-terminal.dto';

export class UpdateTerminalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  stationId: number;

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
