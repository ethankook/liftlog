import { Injectable } from '@nestjs/common';
import { CreatePersonalRecordDto } from './dto/create-personal-record.dto';
import { UpdatePersonalRecordDto } from './dto/update-personal-record.dto';

@Injectable()
export class PersonalRecordsService {
  create(createPersonalRecordDto: CreatePersonalRecordDto) {
    return 'This action adds a new personalRecord';
  }

  findAll() {
    return `This action returns all personalRecords`;
  }

  findOne(id: number) {
    return `This action returns a #${id} personalRecord`;
  }

  update(id: number, updatePersonalRecordDto: UpdatePersonalRecordDto) {
    return `This action updates a #${id} personalRecord`;
  }

  remove(id: number) {
    return `This action removes a #${id} personalRecord`;
  }
}
