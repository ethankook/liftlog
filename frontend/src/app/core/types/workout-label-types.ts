export interface WorkoutLabel {
  id: string;
  name: string;
  slug: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkoutLabelDto { name: string; color?: string; }

export interface UpdateWorkoutLabelDto { name?: string; color?: string; }


