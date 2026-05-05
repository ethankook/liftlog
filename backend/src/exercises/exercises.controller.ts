import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  create(@Body() dto: CreateExerciseDto) {
    return this.exercisesService.create(dto);
  }

  @Get()
  findAll(@Query('primaryMuscleId') primaryMuscleId?: string) {
    return this.exercisesService.findAll(primaryMuscleId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exercisesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExerciseDto) {
    return this.exercisesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exercisesService.remove(id);
  }
}
