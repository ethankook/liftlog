import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { WorkoutLabelsService } from './workout-labels.service';
import { CreateWorkoutLabelDto } from './dto/create-workout-label.dto';
import { UpdateWorkoutLabelDto } from './dto/update-workout-label.dto';

@Controller('workout-labels')
export class WorkoutLabelsController {
  constructor(private readonly workoutLabelsService: WorkoutLabelsService) {}

  @Post()
  create(@Body() createWorkoutLabelDto: CreateWorkoutLabelDto) {
    return this.workoutLabelsService.create(createWorkoutLabelDto);
  }

  @Get()
  findAll() {
    return this.workoutLabelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workoutLabelsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkoutLabelDto) {
    return this.workoutLabelsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workoutLabelsService.remove(id);
  }
}
