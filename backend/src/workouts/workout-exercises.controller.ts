import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CreateWorkoutExerciseDto } from './dto/create-workout-exercise.dto';
import { ReorderWorkoutExercisesDto } from './dto/reorder-workout-exercises.dto';
import { WorkoutExercisesService } from './workout-exercises.service';

@Controller('workouts/:workoutId/exercises')
export class WorkoutExercisesController {
  constructor(private readonly service: WorkoutExercisesService) {}

  @Post()
  create(
    @Param('workoutId') workoutId: string,
    @Body() dto: CreateWorkoutExerciseDto,
  ) {
    return this.service.create(workoutId, dto);
  }

  @Patch('reorder')
  reorder(
    @Param('workoutId') workoutId: string,
    @Body() dto: ReorderWorkoutExercisesDto,
  ) {
    return this.service.reorder(workoutId, dto);
  }

  @Delete(':id')
  remove(@Param('workoutId') workoutId: string, @Param('id') id: string) {
    return this.service.remove(workoutId, id);
  }
}
