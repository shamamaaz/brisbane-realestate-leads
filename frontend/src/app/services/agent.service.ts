import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Agent } from '../models/agent.model';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  private apiUrl = `${environment.apiUrl}/api/agents`;

  constructor(private http: HttpClient) {}

  getAgents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(this.apiUrl);
  }

  createAgent(agent: Partial<Agent>): Observable<Agent> {
    return this.http.post<Agent>(this.apiUrl, agent);
  }

  getAgentById(id: number): Observable<Agent> {
    return this.http.get<Agent>(`${this.apiUrl}/${id}`);
  }

  updateAgent(id: number, payload: Partial<Agent>): Observable<Agent> {
    return this.http.patch<Agent>(`${this.apiUrl}/${id}`, payload);
  }

  getAgentAssignments(agentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${agentId}/assignments`);
  }
}
