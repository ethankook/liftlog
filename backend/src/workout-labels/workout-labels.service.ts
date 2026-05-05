import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutLabelDto } from './dto/create-workout-label.dto';
import { UpdateWorkoutLabelDto } from './dto/update-workout-label.dto';

const slugify = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

@Injectable()
export class WorkoutLabelsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkoutLabelDto) {
    try {
      return await this.prisma.client.workoutLabel.create({
        data: { ...dto, slug: slugify(dto.name) },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      )
        throw new ConflictException('Label name already exists');
      throw e;
    }
  }

  findAll() {
    return this.prisma.client.workoutLabel.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.client.workoutLabel.findUnique({
      where: { id },
    });
    if (!row) throw new NotFoundException();
    return row;
  }

  async update(id: string, dto: UpdateWorkoutLabelDto) {
    await this.findOne(id);
    const data: Prisma.WorkoutLabelUpdateInput = { ...dto };
    if (dto.name) data.slug = slugify(dto.name);
    try {
      return await this.prisma.client.workoutLabel.update({
        where: { id },
        data,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      )
        throw new ConflictException('Label name already exists');
      throw e;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.workoutLabel.delete({ where: { id } });
  }
}
