import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { CreateExerciseDto, ExerciseDetail, ExerciseSummary, UpdateExerciseDto } from '../types';

@Injectable({ providedIn: 'root' })
export class ExercisesService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/exercises`;

  async findAll(primaryMuscleId?: string): Promise<ExerciseSummary[]> {
    const params: Record<string, string> = {};
    if (primaryMuscleId) params['primaryMuscleId'] = primaryMuscleId;
    return firstValueFrom(this.http.get<ExerciseSummary[]>(this.url, { params }));
  }

  async findOne(id: string): Promise<ExerciseDetail> {
    return firstValueFrom(this.http.get<ExerciseDetail>(`${this.url}/${id}`));
  }

  async create(dto: CreateExerciseDto): Promise<ExerciseDetail> {
    return firstValueFrom(this.http.post<ExerciseDetail>(this.url, dto));
  }

  async update(id: string, dto: UpdateExerciseDto): Promise<ExerciseDetail> {
    return firstValueFrom(this.http.patch<ExerciseDetail>(`${this.url}/${id}`, dto));
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }
}
