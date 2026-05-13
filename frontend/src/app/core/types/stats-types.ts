import { MuscleGroup } from './muscle-types';

export interface StatsTotals {
  workouts: number;
  sets: number;
}

export interface MuscleStat {
  muscleId: string;
  name: string;
  color: string;
  group: MuscleGroup;
  sets: number;
}

export interface MuscleGroupStat {
  group: MuscleGroup;
  color: string;
  sets: number;
  muscleCount: number;
}

export interface LabelStat {
  labelId: string;
  name: string;
  color: string | null;
  workouts: number;
}

export interface ExerciseStat {
  exerciseId: string;
  name: string;
  primaryMuscle: { name: string; color: string };
  sets: number;
}

export interface ExercisesByGroup {
  group: MuscleGroup;
  color: string;
  exercises: ExerciseStat[];
}

export interface ExercisesByMuscle {
  muscleId: string;
  muscleName: string;
  muscleColor: string;
  group: MuscleGroup;
  exercises: ExerciseStat[];
}

export interface Stats {
  totals: StatsTotals;
  topMuscles: MuscleStat[];
  bottomMuscles: MuscleStat[];
  topMuscleGroups: MuscleGroupStat[];
  bottomMuscleGroups: MuscleGroupStat[];
  topLabels: LabelStat[];
  topExercises: ExerciseStat[];
  topExercisesByGroup: ExercisesByGroup[];
  topExercisesByMuscle: ExercisesByMuscle[];
}
