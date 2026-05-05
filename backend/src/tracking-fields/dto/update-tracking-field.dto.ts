import { PartialType } from '@nestjs/mapped-types';
import { CreateTrackingFieldDto } from './create-tracking-field.dto';

export class UpdateTrackingFieldDto extends PartialType(
  CreateTrackingFieldDto,
) {}
