import { Controller, Get, Param, Query } from '@nestjs/common';
import { MuscleGroup } from '@prisma/client';
import { MusclesService } from './muscles.service';

@Controller('muscles')
export class MusclesController {
  constructor(private readonly musclesService: MusclesService) {}

  @Get()
  findAll(@Query('group') group?: MuscleGroup) {
    return this.musclesService.findAll(group);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.musclesService.findOne(id);
  }
}
