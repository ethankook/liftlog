import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TrackingFieldsService } from './tracking-fields.service';
import { CreateTrackingFieldDto } from './dto/create-tracking-field.dto';
import { UpdateTrackingFieldDto } from './dto/update-tracking-field.dto';

@Controller('tracking-fields')
export class TrackingFieldsController {
  constructor(private readonly trackingFieldsService: TrackingFieldsService) {}

  @Post()
  create(@Body() createTrackingFieldDto: CreateTrackingFieldDto) {
    return this.trackingFieldsService.create(createTrackingFieldDto);
  }

  @Get()
  findAll() {
    return this.trackingFieldsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trackingFieldsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTrackingFieldDto: UpdateTrackingFieldDto,
  ) {
    return this.trackingFieldsService.update(+id, updateTrackingFieldDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trackingFieldsService.remove(+id);
  }
}
