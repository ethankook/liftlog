import { Test, TestingModule } from '@nestjs/testing';
import { PersonalRecordsService } from './personal-records.service';

describe('PersonalRecordsService', () => {
  let service: PersonalRecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonalRecordsService],
    }).compile();

    service = module.get<PersonalRecordsService>(PersonalRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
