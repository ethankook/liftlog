import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Stats } from '../types';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/stats`;

  async get(): Promise<Stats> {
    return firstValueFrom(this.http.get<Stats>(this.url));
  }
}
