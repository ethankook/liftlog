export interface WorkoutLabel {
  id: string;
  name: string;
  slug: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_WORKOUT_LABEL: WorkoutLabel = {
  id: '',
  name: 'No label',
  slug: 'no-label',
  color: '#6B7280',
  createdAt: '',
  updatedAt: '',
};

export function getWorkoutLabelOrDefault(
  label: WorkoutLabel | null | undefined,
): WorkoutLabel {
  return label ?? DEFAULT_WORKOUT_LABEL;
}

export interface CreateWorkoutLabelDto { name: string; color?: string; }

export interface UpdateWorkoutLabelDto { name?: string; color?: string; }

