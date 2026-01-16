import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Agency } from '../models/agency.model';

@Injectable({
  providedIn: 'root',
})
export class AgencyService {
  private apiUrl = `${environment.apiUrl}/agencies`;

  constructor(private http: HttpClient) {}

  getAgencies(): Observable<Agency[]> {
    return this.http.get<Agency[]>(this.apiUrl);
  }

  getAgencyById(id: number): Observable<Agency> {
    return this.http.get<Agency>(`${this.apiUrl}/${id}`);
  }
}
