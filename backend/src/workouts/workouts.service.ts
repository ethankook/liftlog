import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';

const fullInclude = {
  label: true,
  workoutExercises: {
    orderBy: { sortOrder: 'asc' },
    include: {
      exercise: { include: { primaryMuscle: true, secondaryMuscles: true } },
      sets: { orderBy: { sortOrder: 'asc' } },
    },
  },
} satisfies Prisma.WorkoutInclude;

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkoutDto) {
    try {
      return await this.prisma.client.workout.create({
        data: {
          title: dto.title,
          notes: dto.notes,
          bodyWeight: dto.bodyWeight,
          dateTime: dto.dateTime ? new Date(dto.dateTime) : undefined,
          ...(dto.labelId && { label: { connect: { id: dto.labelId } } }),
        },
        include: { label: true },
      });
    } catch (e) {
      this.mapPrismaError(e);
    }
  }

  findAll(opts: {
    from?: string;
    to?: string;
    labelId?: string;
    limit?: number;
  }) {
    const where: Prisma.WorkoutWhereInput = {};
    if (opts.labelId) where.labelId = opts.labelId;
    if (opts.from || opts.to) {
      where.dateTime = {};
      if (opts.from)
        (where.dateTime as Prisma.DateTimeFilter).gte = new Date(opts.from);
      if (opts.to)
        (where.dateTime as Prisma.DateTimeFilter).lte = new Date(opts.to);
    }
    return this.prisma.client.workout.findMany({
      where,
      orderBy: { dateTime: 'desc' },
      include: { label: true },
      ...(opts.limit !== undefined && { take: opts.limit }),
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.client.workout.findUnique({
      where: { id },
      include: fullInclude,
    });
    if (!row) throw new NotFoundException();
    return row;
  }

  async update(id: string, dto: UpdateWorkoutDto) {
    await this.findOne(id);
    const data: Prisma.WorkoutUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.bodyWeight !== undefined) data.bodyWeight = dto.bodyWeight;
    if (dto.dateTime !== undefined) data.dateTime = new Date(dto.dateTime);
    if (dto.labelId !== undefined)
      data.label = dto.labelId
        ? { connect: { id: dto.labelId } }
        : { disconnect: true };

    try {
      return await this.prisma.client.workout.update({
        where: { id },
        data,
        include: { label: true },
      });
    } catch (e) {
      this.mapPrismaError(e);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.workout.delete({ where: { id } });
  }

  private mapPrismaError(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025')
      throw new BadRequestException('Referenced label not found');
    throw e as Error;
  }
}
