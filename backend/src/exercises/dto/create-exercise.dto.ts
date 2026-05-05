import {
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateExerciseDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsUUID()
  primaryMuscleId: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  secondaryMuscleIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  trackedFieldIds?: string[];
}
