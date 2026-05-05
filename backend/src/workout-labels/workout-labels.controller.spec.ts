import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutLabelsController } from './workout-labels.controller';
import { WorkoutLabelsService } from './workout-labels.service';

describe('WorkoutLabelsController', () => {
  let controller: WorkoutLabelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutLabelsController],
      providers: [WorkoutLabelsService],
    }).compile();

    controller = module.get<WorkoutLabelsController>(WorkoutLabelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
