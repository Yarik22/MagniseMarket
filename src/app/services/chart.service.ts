import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface BarData {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface ChartResponse {
  data: BarData[];
}

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  private readonly baseUrl = `${environment.URI}/api/bars/v1/bars/count-back`;

  private instrumentIdSubject = new BehaviorSubject<string | null>(null);
  instrumentId$ = this.instrumentIdSubject.asObservable();

  constructor(private http: HttpClient) {}

  getChartData(instrumentId: string): Observable<ChartResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${environment.access_token}`,
    });

    const params = {
      instrumentId,
      provider: 'oanda',
      interval: '1',
      periodicity: 'minute',
      barsCount: '100',
    };

    return this.http.get<ChartResponse>(this.baseUrl, { headers, params });
  }

  setInstrumentId(id: string) {
    this.instrumentIdSubject.next(id);
  }
}
