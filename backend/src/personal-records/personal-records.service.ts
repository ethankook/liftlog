import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PRType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type Candidate = {
  setId: string;
  value: number;
  reps: number | null;
  snapshot: Prisma.InputJsonValue;
  date: Date;
};

@Injectable()
export class PersonalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(opts: { exerciseId?: string; type?: PRType }) {
    return this.prisma.client.personalRecord.findMany({
      where: {
        ...(opts.exerciseId && { exerciseId: opts.exerciseId }),
        ...(opts.type && { type: opts.type }),
      },
      orderBy: [{ exerciseId: 'asc' }, { type: 'asc' }, { date: 'desc' }],
      include: { exercise: true },
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.client.personalRecord.findUnique({
      where: { id },
      include: { exercise: true },
    });
    if (!row) throw new NotFoundException();
    return row;
  }

  async recomputeForExercise(exerciseId: string) {
    const exercise = await this.prisma.client.exercise.findUnique({
      where: { id: exerciseId },
      include: { trackedFields: true },
    });
    if (!exercise) return;

    const keys = new Set(exercise.trackedFields.map((f) => f.key));
    const types: PRType[] = [];
    if (keys.has('weight')) types.push(PRType.WEIGHT);
    if (keys.has('distance') && keys.has('time')) types.push(PRType.PACE);
    else if (keys.has('distance')) types.push(PRType.DISTANCE);
    if (types.length === 0) {
      await this.prisma.client.personalRecord.deleteMany({
        where: { exerciseId },
      });
      return;
    }

    const sets = await this.prisma.client.setEntry.findMany({
      where: { workoutExercise: { exerciseId } },
      include: { workoutExercise: { include: { workout: true } } },
    });
    sets.sort(
      (a, b) =>
        a.workoutExercise.workout.dateTime.getTime() -
        b.workoutExercise.workout.dateTime.getTime(),
    );

    for (const type of types) {
      let best: Candidate | undefined;
      for (const s of sets) {
        const c = this.candidateFor(type, s);
        if (c && (!best || this.beats(type, c, best))) best = c;
      }

      await this.prisma.client.$transaction([
        this.prisma.client.personalRecord.deleteMany({
          where: { exerciseId, type },
        }),
        ...(best
          ? [
              this.prisma.client.personalRecord.create({
                data: {
                  exerciseId,
                  type,
                  value: best.value,
                  reps: best.reps,
                  snapshot: best.snapshot,
                  date: best.date,
                  sourceSetId: best.setId,
                },
              }),
            ]
          : []),
      ]);
    }
  }

  private candidateFor(
    type: PRType,
    set: {
      id: string;
      values: Prisma.JsonValue;
      workoutExercise: { workout: { dateTime: Date } };
    },
  ): Candidate | null {
    const v = (set.values ?? {}) as Record<string, unknown>;
    const date = set.workoutExercise.workout.dateTime;
    const num = (k: string) => (typeof v[k] === 'number' ? v[k] : null);

    if (type === PRType.WEIGHT) {
      const weight = num('weight');
      if (weight === null) return null;
      return {
        setId: set.id,
        value: weight,
        reps: num('reps'),
        snapshot: v as Prisma.InputJsonValue,
        date,
      };
    }
    if (type === PRType.PACE) {
      const distance = num('distance');
      const time = num('time');
      if (distance === null || time === null || distance === 0) return null;
      return {
        setId: set.id,
        value: time / distance,
        reps: null,
        snapshot: v as Prisma.InputJsonValue,
        date,
      };
    }
    if (type === PRType.DISTANCE) {
      const distance = num('distance');
      if (distance === null) return null;
      return {
        setId: set.id,
        value: distance,
        reps: null,
        snapshot: v as Prisma.InputJsonValue,
        date,
      };
    }
    return null;
  }

  private beats(type: PRType, a: Candidate, b: Candidate): boolean {
    if (type === PRType.WEIGHT) {
      if (a.value > b.value) return true;
      if (a.value < b.value) return false;
      return (a.reps ?? 0) > (b.reps ?? 0);
    }
    if (type === PRType.PACE) return a.value < b.value;
    if (type === PRType.DISTANCE) return a.value > b.value;
    return false;
  }
}
