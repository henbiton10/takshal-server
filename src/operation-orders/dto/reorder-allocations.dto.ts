import { IsArray, IsNumber, ValidateNested, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class AllocationOrderDto {
  @IsNumber()
  id: number;

  @IsNumber()
  orderNumber: number;

  @ValidateIf((o) => o.subOrderNumber !== null)
  @IsNumber()
  subOrderNumber: number | null;
}

export class ReorderAllocationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllocationOrderDto)
  allocations: AllocationOrderDto[];
}
