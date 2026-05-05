import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkoutLabelDto } from './create-workout-label.dto';

export class UpdateWorkoutLabelDto extends PartialType(CreateWorkoutLabelDto) {}
