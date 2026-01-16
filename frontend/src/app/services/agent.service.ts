import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Agent } from '../models/agent.model';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  private apiUrl = `${environment.apiUrl}/agents`;

  constructor(private http: HttpClient) {}

  getAgents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(this.apiUrl);
  }

  getAgentById(id: number): Observable<Agent> {
    return this.http.get<Agent>(`${this.apiUrl}/${id}`);
  }

  getAgentAssignments(agentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${agentId}/assignments`);
  }
}
