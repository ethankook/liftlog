import { Test, TestingModule } from '@nestjs/testing';
import { TrackingFieldsService } from './tracking-fields.service';

describe('TrackingFieldsService', () => {
  let service: TrackingFieldsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackingFieldsService],
    }).compile();

    service = module.get<TrackingFieldsService>(TrackingFieldsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
