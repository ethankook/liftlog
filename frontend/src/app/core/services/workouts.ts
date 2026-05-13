import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import {
  CreateSetEntryDto,
  CreateWorkoutDto,
  CreateWorkoutExerciseDto,
  ReorderWorkoutExercisesDto,
  SetEntry,
  UpdateSetEntryDto,
  UpdateWorkoutDto,
  WorkoutDetail,
  WorkoutExerciseDetail,
  WorkoutSummary,
} from '../types';

@Injectable({ providedIn: 'root' })
export class WorkoutsService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/workouts`;

  // --- Workouts ---

  async findAll(opts?: {
    from?: string;
    to?: string;
    labelId?: string;
    limit?: number;
  }): Promise<WorkoutSummary[]> {
    const params: Record<string, string> = {};
    if (opts?.from) params['from'] = opts.from;
    if (opts?.to) params['to'] = opts.to;
    if (opts?.labelId) params['labelId'] = opts.labelId;
    if (opts?.limit !== undefined) params['limit'] = String(opts.limit);
    return firstValueFrom(this.http.get<WorkoutSummary[]>(this.url, { params }));
  }

  async findOne(id: string): Promise<WorkoutDetail> {
    return firstValueFrom(this.http.get<WorkoutDetail>(`${this.url}/${id}`));
  }

  async create(dto: CreateWorkoutDto): Promise<WorkoutSummary> {
    return firstValueFrom(this.http.post<WorkoutSummary>(this.url, dto));
  }

  async update(id: string, dto: UpdateWorkoutDto): Promise<WorkoutSummary> {
    return firstValueFrom(this.http.patch<WorkoutSummary>(`${this.url}/${id}`, dto));
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }

  // --- Workout Exercises ---

  async addExercise(
    workoutId: string,
    dto: CreateWorkoutExerciseDto,
  ): Promise<WorkoutExerciseDetail> {
    return firstValueFrom(
      this.http.post<WorkoutExerciseDetail>(`${this.url}/${workoutId}/exercises`, dto),
    );
  }

  async reorderExercises(workoutId: string, dto: ReorderWorkoutExercisesDto): Promise<void> {
    await firstValueFrom(this.http.patch<void>(`${this.url}/${workoutId}/exercises/reorder`, dto));
  }

  async removeExercise(workoutId: string, exerciseId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.url}/${workoutId}/exercises/${exerciseId}`),
    );
  }

  // --- Set Entries ---

  async addSet(workoutId: string, weId: string, dto: CreateSetEntryDto): Promise<SetEntry> {
    return firstValueFrom(
      this.http.post<SetEntry>(`${this.url}/${workoutId}/exercises/${weId}/sets`, dto),
    );
  }

  async updateSet(
    workoutId: string,
    weId: string,
    setId: string,
    dto: UpdateSetEntryDto,
  ): Promise<SetEntry> {
    return firstValueFrom(
      this.http.patch<SetEntry>(`${this.url}/${workoutId}/exercises/${weId}/sets/${setId}`, dto),
    );
  }

  async removeSet(workoutId: string, weId: string, setId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.url}/${workoutId}/exercises/${weId}/sets/${setId}`, {
        responseType: 'text',
      }),
    );
  }
}
