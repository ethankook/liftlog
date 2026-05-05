import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CreateSetEntryDto } from './dto/create-set-entry.dto';
import { UpdateSetEntryDto } from './dto/update-set-entry.dto';
import { SetEntriesService } from './set-entries.service';

@Controller('workouts/:workoutId/exercises/:weId/sets')
export class SetEntriesController {
  constructor(private readonly service: SetEntriesService) {}

  @Post()
  create(
    @Param('workoutId') workoutId: string,
    @Param('weId') weId: string,
    @Body() dto: CreateSetEntryDto,
  ) {
    return this.service.create(workoutId, weId, dto);
  }

  @Patch(':id')
  update(
    @Param('workoutId') workoutId: string,
    @Param('weId') weId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSetEntryDto,
  ) {
    return this.service.update(workoutId, weId, id, dto);
  }

  @Delete(':id')
  remove(
    @Param('workoutId') workoutId: string,
    @Param('weId') weId: string,
    @Param('id') id: string,
  ) {
    return this.service.remove(workoutId, weId, id);
  }
}
