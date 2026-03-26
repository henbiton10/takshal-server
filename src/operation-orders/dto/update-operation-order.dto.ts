import { PartialType } from '@nestjs/mapped-types';
import { CreateOperationOrderDto } from './create-operation-order.dto';

export class UpdateOperationOrderDto extends PartialType(CreateOperationOrderDto) {}
