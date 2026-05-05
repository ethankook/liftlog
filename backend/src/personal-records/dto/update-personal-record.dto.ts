import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonalRecordDto } from './create-personal-record.dto';

export class UpdatePersonalRecordDto extends PartialType(
  CreatePersonalRecordDto,
) {}
