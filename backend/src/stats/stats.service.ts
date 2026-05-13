import { Injectable } from '@nestjs/common';
import { MuscleGroup } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface MuscleStatRow {
  muscleId: string;
  name: string;
  color: string;
  group: MuscleGroup;
  sets: number;
}

interface MuscleGroupStatRow {
  group: MuscleGroup;
  color: string;
  sets: number;
  muscleCount: number;
}

interface LabelStatRow {
  labelId: string;
  name: string;
  color: string | null;
  workouts: number;
}

interface ExerciseStatRow {
  exerciseId: string;
  name: string;
  primaryMuscle: { name: string; color: string };
  sets: number;
}

interface ExerciseStatRowInternal extends ExerciseStatRow {
  primaryMuscleId: string;
  primaryMuscleGroup: MuscleGroup;
}

interface ExercisesByGroupRow {
  group: MuscleGroup;
  color: string;
  exercises: ExerciseStatRow[];
}

interface ExercisesByMuscleRow {
  muscleId: string;
  muscleName: string;
  muscleColor: string;
  group: MuscleGroup;
  exercises: ExerciseStatRow[];
}

export interface StatsResponse {
  totals: { workouts: number; sets: number };
  topMuscles: MuscleStatRow[];
  bottomMuscles: MuscleStatRow[];
  topMuscleGroups: MuscleGroupStatRow[];
  bottomMuscleGroups: MuscleGroupStatRow[];
  topLabels: LabelStatRow[];
  topExercises: ExerciseStatRow[];
  topExercisesByGroup: ExercisesByGroupRow[];
  topExercisesByMuscle: ExercisesByMuscleRow[];
}

const TOP_N = 5;
const TOP_PER_SLICE = 5;

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<StatsResponse> {
    const [workouts, sets, allMuscles, topLabels, allExercises] =
      await Promise.all([
        this.prisma.client.workout.count(),
        this.prisma.client.setEntry.count(),
        this.computeAllMuscles(),
        this.computeTopLabels(),
        this.computeAllExercises(),
      ]);

    const musclesByDesc = [...allMuscles].sort(this.muscleDescCmp);
    const musclesByAsc = [...allMuscles].sort(this.muscleAscCmp);

    const groupAggregates = this.aggregateMuscleGroups(allMuscles);
    const groupsByDesc = [...groupAggregates].sort(this.groupDescCmp);
    const groupsByAsc = [...groupAggregates].sort(this.groupAscCmp);

    const exercisesByDesc = [...allExercises].sort(this.exerciseDescCmp);

    return {
      totals: { workouts, sets },
      topMuscles: musclesByDesc.slice(0, TOP_N),
      bottomMuscles: musclesByAsc.slice(0, TOP_N),
      topMuscleGroups: groupsByDesc.slice(0, TOP_N),
      bottomMuscleGroups: groupsByAsc.slice(0, TOP_N),
      topLabels,
      topExercises: exercisesByDesc.slice(0, TOP_N).map(this.toPublicExercise),
      topExercisesByGroup: this.sliceExercisesByGroup(allExercises, allMuscles),
      topExercisesByMuscle: this.sliceExercisesByMuscle(
        allExercises,
        allMuscles,
      ),
    };
  }

  private async computeAllMuscles(): Promise<MuscleStatRow[]> {
    const rows = await this.prisma.client.$queryRaw<
      Array<{
        muscleId: string;
        name: string;
        color: string;
        group: MuscleGroup;
        sets: number | string;
      }>
    >`
      WITH set_counts AS (
        SELECT we."exerciseId", COUNT(*)::float AS sets
        FROM "SetEntry" se
        JOIN "WorkoutExercise" we ON we.id = se."workoutExerciseId"
        GROUP BY we."exerciseId"
      ),
      contribs AS (
        SELECT e."primaryMuscleId" AS "muscleId", sc.sets * 1.0 AS contrib
        FROM set_counts sc
        JOIN "Exercise" e ON e.id = sc."exerciseId"
        UNION ALL
        SELECT sm."B" AS "muscleId", sc.sets * 0.5 AS contrib
        FROM set_counts sc
        JOIN "_SecondaryMuscle" sm ON sm."A" = sc."exerciseId"
      ),
      muscle_sets AS (
        SELECT "muscleId", SUM(contrib) AS sets
        FROM contribs
        GROUP BY "muscleId"
      )
      SELECT m.id AS "muscleId",
             m.name,
             m.color,
             m."group" AS "group",
             COALESCE(ms.sets, 0)::float AS sets
      FROM "Muscle" m
      LEFT JOIN muscle_sets ms ON ms."muscleId" = m.id;
    `;

    return rows.map((row) => ({
      muscleId: row.muscleId,
      name: row.name,
      color: row.color,
      group: row.group,
      sets: Number(row.sets),
    }));
  }

  private async computeTopLabels(): Promise<LabelStatRow[]> {
    const grouped = await this.prisma.client.workout.groupBy({
      by: ['labelId'],
      _count: { _all: true },
      where: { labelId: { not: null } },
      orderBy: { _count: { id: 'desc' } },
      take: TOP_N,
    });

    const labelIds = grouped
      .map((g) => g.labelId)
      .filter((id): id is string => id !== null);
    if (labelIds.length === 0) return [];

    const labels = await this.prisma.client.workoutLabel.findMany({
      where: { id: { in: labelIds } },
      select: { id: true, name: true, color: true },
    });
    const labelById = new Map(labels.map((l) => [l.id, l]));

    return grouped
      .map((g) => {
        const label = labelById.get(g.labelId!);
        if (!label) return null;
        return {
          labelId: label.id,
          name: label.name,
          color: label.color,
          workouts: g._count._all,
        };
      })
      .filter((row): row is LabelStatRow => row !== null)
      .sort((a, b) => b.workouts - a.workouts || a.name.localeCompare(b.name))
      .slice(0, TOP_N);
  }

  private async computeAllExercises(): Promise<ExerciseStatRowInternal[]> {
    const grouped = await this.prisma.client.setEntry.groupBy({
      by: ['workoutExerciseId'],
      _count: { _all: true },
    });
    if (grouped.length === 0) return [];

    const weRows = await this.prisma.client.workoutExercise.findMany({
      where: { id: { in: grouped.map((g) => g.workoutExerciseId) } },
      select: { id: true, exerciseId: true },
    });
    const exerciseIdByWe = new Map(weRows.map((w) => [w.id, w.exerciseId]));

    const setsByExercise = new Map<string, number>();
    for (const g of grouped) {
      const exerciseId = exerciseIdByWe.get(g.workoutExerciseId);
      if (!exerciseId) continue;
      setsByExercise.set(
        exerciseId,
        (setsByExercise.get(exerciseId) ?? 0) + g._count._all,
      );
    }
    if (setsByExercise.size === 0) return [];

    const exercises = await this.prisma.client.exercise.findMany({
      where: { id: { in: Array.from(setsByExercise.keys()) } },
      select: {
        id: true,
        name: true,
        primaryMuscleId: true,
        primaryMuscle: { select: { name: true, color: true, group: true } },
      },
    });

    return exercises.map((e) => ({
      exerciseId: e.id,
      name: e.name,
      primaryMuscle: {
        name: e.primaryMuscle.name,
        color: e.primaryMuscle.color,
      },
      primaryMuscleId: e.primaryMuscleId,
      primaryMuscleGroup: e.primaryMuscle.group,
      sets: setsByExercise.get(e.id) ?? 0,
    }));
  }

  private aggregateMuscleGroups(
    muscles: MuscleStatRow[],
  ): MuscleGroupStatRow[] {
    const byGroup = new Map<
      MuscleGroup,
      { sets: number; muscleCount: number; topColor: string; topSets: number }
    >();
    for (const m of muscles) {
      const entry = byGroup.get(m.group);
      if (!entry) {
        byGroup.set(m.group, {
          sets: m.sets,
          muscleCount: 1,
          topColor: m.color,
          topSets: m.sets,
        });
      } else {
        entry.sets += m.sets;
        entry.muscleCount += 1;
        if (m.sets > entry.topSets) {
          entry.topSets = m.sets;
          entry.topColor = m.color;
        }
      }
    }
    return Array.from(byGroup.entries()).map(([group, data]) => ({
      group,
      color: data.topColor,
      sets: data.sets,
      muscleCount: data.muscleCount,
    }));
  }

  private sliceExercisesByGroup(
    allExercises: ExerciseStatRowInternal[],
    allMuscles: MuscleStatRow[],
  ): ExercisesByGroupRow[] {
    const colorByGroup = new Map<MuscleGroup, string>();
    const topSetsByGroup = new Map<MuscleGroup, number>();
    for (const m of allMuscles) {
      const top = topSetsByGroup.get(m.group) ?? -1;
      if (m.sets > top) {
        topSetsByGroup.set(m.group, m.sets);
        colorByGroup.set(m.group, m.color);
      } else if (!colorByGroup.has(m.group)) {
        colorByGroup.set(m.group, m.color);
      }
    }

    const byGroup = new Map<MuscleGroup, ExerciseStatRowInternal[]>();
    for (const e of allExercises) {
      const list = byGroup.get(e.primaryMuscleGroup) ?? [];
      list.push(e);
      byGroup.set(e.primaryMuscleGroup, list);
    }

    return Array.from(byGroup.entries())
      .map(([group, exercises]) => ({
        group,
        color: colorByGroup.get(group) ?? '#888888',
        exercises: exercises
          .sort(this.exerciseDescCmp)
          .slice(0, TOP_PER_SLICE)
          .map(this.toPublicExercise),
      }))
      .sort((a, b) => a.group.localeCompare(b.group));
  }

  private sliceExercisesByMuscle(
    allExercises: ExerciseStatRowInternal[],
    allMuscles: MuscleStatRow[],
  ): ExercisesByMuscleRow[] {
    const byMuscle = new Map<string, ExerciseStatRowInternal[]>();
    for (const e of allExercises) {
      const list = byMuscle.get(e.primaryMuscleId) ?? [];
      list.push(e);
      byMuscle.set(e.primaryMuscleId, list);
    }

    const muscleById = new Map(allMuscles.map((m) => [m.muscleId, m]));

    return Array.from(byMuscle.entries())
      .map(([muscleId, exercises]) => {
        const muscle = muscleById.get(muscleId);
        return {
          muscleId,
          muscleName: muscle?.name ?? 'Unknown',
          muscleColor: muscle?.color ?? '#888888',
          group: muscle?.group ?? 'CORE',
          exercises: exercises
            .sort(this.exerciseDescCmp)
            .slice(0, TOP_PER_SLICE)
            .map(this.toPublicExercise),
        };
      })
      .sort((a, b) => a.muscleName.localeCompare(b.muscleName));
  }

  private readonly muscleDescCmp = (a: MuscleStatRow, b: MuscleStatRow) =>
    b.sets - a.sets || a.name.localeCompare(b.name);

  private readonly muscleAscCmp = (a: MuscleStatRow, b: MuscleStatRow) =>
    a.sets - b.sets || a.name.localeCompare(b.name);

  private readonly groupDescCmp = (
    a: MuscleGroupStatRow,
    b: MuscleGroupStatRow,
  ) => b.sets - a.sets || a.group.localeCompare(b.group);

  private readonly groupAscCmp = (
    a: MuscleGroupStatRow,
    b: MuscleGroupStatRow,
  ) => a.sets - b.sets || a.group.localeCompare(b.group);

  private readonly exerciseDescCmp = (
    a: ExerciseStatRowInternal,
    b: ExerciseStatRowInternal,
  ) => b.sets - a.sets || a.name.localeCompare(b.name);

  private readonly toPublicExercise = (
    e: ExerciseStatRowInternal,
  ): ExerciseStatRow => ({
    exerciseId: e.exerciseId,
    name: e.name,
    primaryMuscle: e.primaryMuscle,
    sets: e.sets,
  });
}
