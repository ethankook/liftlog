import { Controller, Get, Param } from '@nestjs/common';
import { TrackingFieldsService } from './tracking-fields.service';

@Controller('tracking-fields')
export class TrackingFieldsController {
  constructor(private readonly trackingFieldsService: TrackingFieldsService) {}

  @Get()
  findAll() {
    return this.trackingFieldsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trackingFieldsService.findOne(id);
  }
}
