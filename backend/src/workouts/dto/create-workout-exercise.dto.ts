import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateWorkoutExerciseDto {
  @IsUUID()
  exerciseId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
