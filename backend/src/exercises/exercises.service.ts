import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExerciseDto) {
    const {
      name,
      primaryMuscleId,
      secondaryMuscleIds = [],
      trackedFieldIds = [],
    } = dto;
    try {
      return await this.prisma.client.exercise.create({
        data: {
          name,
          primaryMuscle: { connect: { id: primaryMuscleId } },
          secondaryMuscles: {
            connect: secondaryMuscleIds.map((id) => ({ id })),
          },
          trackedFields: { connect: trackedFieldIds.map((id) => ({ id })) },
        },
        include: {
          primaryMuscle: true,
          secondaryMuscles: true,
          trackedFields: true,
        },
      });
    } catch (e) {
      this.mapPrismaError(e);
    }
  }

  findAll(primaryMuscleId?: string) {
    return this.prisma.client.exercise.findMany({
      where: primaryMuscleId ? { primaryMuscleId } : undefined,
      orderBy: { name: 'asc' },
      include: { primaryMuscle: true },
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.client.exercise.findUnique({
      where: { id },
      include: {
        primaryMuscle: true,
        secondaryMuscles: true,
        trackedFields: true,
      },
    });
    if (!row) throw new NotFoundException();
    return row;
  }

  async update(id: string, dto: UpdateExerciseDto) {
    await this.findOne(id);
    const data: Prisma.ExerciseUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.primaryMuscleId !== undefined)
      data.primaryMuscle = { connect: { id: dto.primaryMuscleId } };
    if (dto.secondaryMuscleIds !== undefined)
      data.secondaryMuscles = {
        set: dto.secondaryMuscleIds.map((id) => ({ id })),
      };
    if (dto.trackedFieldIds !== undefined)
      data.trackedFields = { set: dto.trackedFieldIds.map((id) => ({ id })) };

    try {
      return await this.prisma.client.exercise.update({
        where: { id },
        data,
        include: {
          primaryMuscle: true,
          secondaryMuscles: true,
          trackedFields: true,
        },
      });
    } catch (e) {
      this.mapPrismaError(e);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    const inUse = await this.prisma.client.workoutExercise.count({
      where: { exerciseId: id },
    });
    if (inUse > 0)
      throw new ConflictException('Exercise is used by existing workouts');
    return this.prisma.client.exercise.delete({ where: { id } });
  }

  private mapPrismaError(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002')
        throw new ConflictException('Exercise name already exists');
      if (e.code === 'P2025')
        throw new BadRequestException(
          'Referenced muscle or tracking field not found',
        );
    }
    throw e as Error;
  }
}
