import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Muscle, MuscleGroup } from '../types';

@Injectable({
  providedIn: 'root',
})
@Injectable({ providedIn: 'root' })
export class MusclesService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/muscles`;

  async findAll(group?: MuscleGroup): Promise<Muscle[]> {
    const params: Record<string, string> = {};
    if (group) params['group'] = group;
    return firstValueFrom(this.http.get<Muscle[]>(this.url, { params }));
  }

  async findOne(id: string): Promise<Muscle> {
    return firstValueFrom(this.http.get<Muscle>(`${this.url}/${id}`));
  }
}
