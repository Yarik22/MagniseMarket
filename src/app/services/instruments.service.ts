import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface Instrument {
  id: string;
  symbol: string;
  kind: string;
  description: string;
  tickSize: number;
  currency: string;
  baseCurrency: string;
}

export interface Paging {
  page: number;
  pages: number;
  items: number;
}

export interface InstrumentsResponse {
  paging: Paging;
  data: Instrument[];
}

@Injectable({
  providedIn: 'root',
})
export class InstrumentsService {
  private readonly baseUrl = `${environment.URI}/api/instruments/v1/instruments`;

  constructor(private http: HttpClient) {}

  getInstruments(
    provider: string,
    kind: string,
    page: number,
    size: number
  ): Observable<InstrumentsResponse> {
    const params = new HttpParams()
      .set('provider', provider)
      .set('kind', kind)
      .set('page', page.toString())
      .set('size', size.toString());

    const headers = new HttpHeaders({
      Authorization: `Bearer ${environment.access_token}`,
    });

    return this.http.get<InstrumentsResponse>(this.baseUrl, {
      headers,
      params,
    });
  }
}
