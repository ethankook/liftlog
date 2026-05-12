import { Muscle } from './muscle-types';
import { TrackingField } from './tracking-field-types';

export interface ExerciseSummary {
  id: string;
  name: string;
  primaryMuscleId: string;
  primaryMuscle: Muscle;
  secondaryMuscles: Muscle[];
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseDetail extends ExerciseSummary {
  trackedFields: TrackingField[];
}

export interface CreateExerciseDto {
  name: string;
  primaryMuscleId: string;
  secondaryMuscleIds?: string[];
  trackedFieldIds?: string[];
}

export interface UpdateExerciseDto {
  name?: string;
  primaryMuscleId?: string;
  secondaryMuscleIds?: string[];
  trackedFieldIds?: string[];
}
