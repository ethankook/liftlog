import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutLabelsService } from './workout-labels.service';

describe('WorkoutLabelsService', () => {
  let service: WorkoutLabelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkoutLabelsService],
    }).compile();

    service = module.get<WorkoutLabelsService>(WorkoutLabelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
