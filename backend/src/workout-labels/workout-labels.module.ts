import { Module } from '@nestjs/common';
import { WorkoutLabelsService } from './workout-labels.service';
import { WorkoutLabelsController } from './workout-labels.controller';

@Module({
  controllers: [WorkoutLabelsController],
  providers: [WorkoutLabelsService],
})
export class WorkoutLabelsModule {}
