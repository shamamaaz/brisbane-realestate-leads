import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AgentOffer, CreateAgentOffer } from '../models/agent-offer.model';

@Injectable({
  providedIn: 'root',
})
export class OfferService {
  private apiUrl = `${environment.apiUrl}/api/offers`;

  constructor(private http: HttpClient) {}

  createOffer(payload: CreateAgentOffer): Observable<AgentOffer> {
    return this.http.post<AgentOffer>(this.apiUrl, payload);
  }

  getOffersByLead(leadId: number): Observable<AgentOffer[]> {
    return this.http.get<AgentOffer[]>(`${this.apiUrl}/lead/${leadId}`);
  }
}
