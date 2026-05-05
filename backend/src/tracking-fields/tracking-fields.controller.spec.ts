import { Test, TestingModule } from '@nestjs/testing';
import { TrackingFieldsController } from './tracking-fields.controller';
import { TrackingFieldsService } from './tracking-fields.service';

describe('TrackingFieldsController', () => {
  let controller: TrackingFieldsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrackingFieldsController],
      providers: [TrackingFieldsService],
    }).compile();

    controller = module.get<TrackingFieldsController>(TrackingFieldsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
