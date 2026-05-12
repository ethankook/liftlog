import { ExerciseSummary } from './exercise-types';
import { WorkoutLabel } from './workout-label-types';

export interface SetEntry {
  id: string;
  workoutExerciseId: string;
  values: Record<string, unknown>;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutExerciseDetail {
  id: string;
  workoutId: string;
  exerciseId: string;
  exercise: ExerciseSummary;
  sets: SetEntry[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSummary {
  id: string;
  title: string;
  labelId: string | null;
  label: WorkoutLabel | null;
  bodyWeight: number | null;
  notes: string | null;
  dateTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutDetail extends WorkoutSummary {
  workoutExercises: WorkoutExerciseDetail[];
}

export interface CreateWorkoutDto {
  title: string;
  labelId?: string;
  bodyWeight?: number;
  notes?: string;
  dateTime?: string;
}

export interface UpdateWorkoutDto {
  title?: string;
  labelId?: string;
  bodyWeight?: number;
  notes?: string;
  dateTime?: string;
}

export interface CreateWorkoutExerciseDto {
  exerciseId: string;
  sortOrder?: number;
}

export interface ReorderWorkoutExercisesDto {
  orderedIds: string[];
}

export interface CreateSetEntryDto {
  values: Record<string, unknown>;
  notes?: string;
  sortOrder?: number;
}

export interface UpdateSetEntryDto {
  values?: Record<string, unknown>;
  notes?: string;
  sortOrder?: number;
}
