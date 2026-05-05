import { Module } from '@nestjs/common';
import { PersonalRecordsService } from './personal-records.service';
import { PersonalRecordsController } from './personal-records.controller';

@Module({
  controllers: [PersonalRecordsController],
  providers: [PersonalRecordsService],
})
export class PersonalRecordsModule {}
