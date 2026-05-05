import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutExerciseDto } from './dto/create-workout-exercise.dto';
import { ReorderWorkoutExercisesDto } from './dto/reorder-workout-exercises.dto';

@Injectable()
export class WorkoutExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(workoutId: string, dto: CreateWorkoutExerciseDto) {
    await this.assertWorkout(workoutId);
    const sortOrder = dto.sortOrder ?? (await this.nextSortOrder(workoutId));
    try {
      return await this.prisma.client.workoutExercise.create({
        data: {
          workout: { connect: { id: workoutId } },
          exercise: { connect: { id: dto.exerciseId } },
          sortOrder,
        },
        include: { exercise: { include: { primaryMuscle: true } } },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      )
        throw new BadRequestException('Exercise not found');
      throw e;
    }
  }

  async reorder(workoutId: string, dto: ReorderWorkoutExercisesDto) {
    await this.assertWorkout(workoutId);
    const existing = await this.prisma.client.workoutExercise.findMany({
      where: { workoutId },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((r) => r.id));
    if (
      dto.orderedIds.length !== existingIds.size ||
      dto.orderedIds.some((id) => !existingIds.has(id))
    )
      throw new ConflictException(
        'orderedIds must contain exactly the workout exercises of this workout',
      );

    return this.prisma.client.$transaction(
      dto.orderedIds.map((id, idx) =>
        this.prisma.client.workoutExercise.update({
          where: { id },
          data: { sortOrder: idx },
        }),
      ),
    );
  }

  async remove(workoutId: string, id: string) {
    await this.assertWorkoutExercise(workoutId, id);
    return this.prisma.client.workoutExercise.delete({ where: { id } });
  }

  private async assertWorkout(workoutId: string) {
    const exists = await this.prisma.client.workout.findUnique({
      where: { id: workoutId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Workout not found');
  }

  private async assertWorkoutExercise(workoutId: string, id: string) {
    const row = await this.prisma.client.workoutExercise.findUnique({
      where: { id },
      select: { workoutId: true },
    });
    if (!row || row.workoutId !== workoutId)
      throw new NotFoundException('Workout exercise not found');
  }

  private async nextSortOrder(workoutId: string) {
    const last = await this.prisma.client.workoutExercise.findFirst({
      where: { workoutId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    return last ? last.sortOrder + 1 : 0;
  }
}
