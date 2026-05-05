import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PersonalRecordsService } from './personal-records.service';
import { CreatePersonalRecordDto } from './dto/create-personal-record.dto';
import { UpdatePersonalRecordDto } from './dto/update-personal-record.dto';

@Controller('personal-records')
export class PersonalRecordsController {
  constructor(
    private readonly personalRecordsService: PersonalRecordsService,
  ) {}

  @Post()
  create(@Body() createPersonalRecordDto: CreatePersonalRecordDto) {
    return this.personalRecordsService.create(createPersonalRecordDto);
  }

  @Get()
  findAll() {
    return this.personalRecordsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personalRecordsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePersonalRecordDto: UpdatePersonalRecordDto,
  ) {
    return this.personalRecordsService.update(+id, updatePersonalRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personalRecordsService.remove(+id);
  }
}
