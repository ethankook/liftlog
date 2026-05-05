import { PartialType } from '@nestjs/mapped-types';
import { CreateSetEntryDto } from './create-set-entry.dto';

export class UpdateSetEntryDto extends PartialType(CreateSetEntryDto) {}
