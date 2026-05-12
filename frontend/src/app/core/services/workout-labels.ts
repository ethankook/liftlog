import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CreateWorkoutLabelDto, UpdateWorkoutLabelDto, WorkoutLabel } from '../types';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkoutLabelsService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/workout-labels`;

  async findAll(): Promise<WorkoutLabel[]> {
    return firstValueFrom(this.http.get<WorkoutLabel[]>(this.url));
  }

  async findOne(id: string): Promise<WorkoutLabel> {
    return firstValueFrom(this.http.get<WorkoutLabel>(`${this.url}/${id}`));
  }

  async create(dto: CreateWorkoutLabelDto): Promise<WorkoutLabel> {
    return firstValueFrom(this.http.post<WorkoutLabel>(this.url, dto));
  }

  async update(id: string, dto: UpdateWorkoutLabelDto): Promise<WorkoutLabel> {
    return firstValueFrom(this.http.patch<WorkoutLabel>(`${this.url}/${id}`, dto));
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }
}
