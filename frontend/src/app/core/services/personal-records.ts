import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { PersonalRecord } from '../types';

@Injectable({ providedIn: 'root' })
export class PersonalRecordsService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/personal-records`;

  async findAll(exerciseId: string): Promise<PersonalRecord[]> {
    return firstValueFrom(this.http.get<PersonalRecord[]>(this.url, { params: { exerciseId } }));
  }

  async findOne(id: string): Promise<PersonalRecord> {
    return firstValueFrom(this.http.get<PersonalRecord>(`${this.url}/${id}`));
  }
}
