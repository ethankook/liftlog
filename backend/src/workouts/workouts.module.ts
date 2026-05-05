import { Module } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { WorkoutsController } from './workouts.controller';
import { WorkoutExercisesService } from './workout-exercises.service';
import { WorkoutExercisesController } from './workout-exercises.controller';
import { SetEntriesService } from './set-entries.service';
import { SetEntriesController } from './set-entries.controller';
import { PersonalRecordsModule } from '../personal-records/personal-records.module';

@Module({
  imports: [PersonalRecordsModule],
  controllers: [
    WorkoutsController,
    WorkoutExercisesController,
    SetEntriesController,
  ],
  providers: [WorkoutsService, WorkoutExercisesService, SetEntriesService],
})
export class WorkoutsModule {}
