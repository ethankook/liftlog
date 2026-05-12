import { ExerciseSummary } from './exercise-types';

export type PRType = 'WEIGHT' | 'PACE' | 'REPS' | 'DISTANCE' | 'TIME';

export interface PersonalRecord {
  id: string;
  type: PRType;
  value: number;
  reps: number | null;
  snapshot: Record<string, unknown> | null;
  date: string;
  exerciseId: string;
  exercise: ExerciseSummary;
  sourceSetId: string;
  createdAt: string;
  updatedAt: string;
}
