import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { TrackingField } from '../types';

@Injectable({ providedIn: 'root' })
export class TrackingFieldsService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/tracking-fields`;

  async findAll(): Promise<TrackingField[]> {
    return firstValueFrom(this.http.get<TrackingField[]>(this.url));
  }

  async findOne(id: string): Promise<TrackingField> {
    return firstValueFrom(this.http.get<TrackingField>(`${this.url}/${id}`));
  }
}
