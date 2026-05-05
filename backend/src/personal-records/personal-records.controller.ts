import { Controller, Get, Param, Query } from '@nestjs/common';
import { PRType } from '@prisma/client';
import { PersonalRecordsService } from './personal-records.service';

@Controller('personal-records')
export class PersonalRecordsController {
  constructor(private readonly service: PersonalRecordsService) {}

  @Get()
  findAll(
    @Query('exerciseId') exerciseId?: string,
    @Query('type') type?: PRType,
  ) {
    return this.service.findAll({ exerciseId, type });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
