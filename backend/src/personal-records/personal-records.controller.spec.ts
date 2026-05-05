import { Test, TestingModule } from '@nestjs/testing';
import { PersonalRecordsController } from './personal-records.controller';
import { PersonalRecordsService } from './personal-records.service';

describe('PersonalRecordsController', () => {
  let controller: PersonalRecordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonalRecordsController],
      providers: [PersonalRecordsService],
    }).compile();

    controller = module.get<PersonalRecordsController>(
      PersonalRecordsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
