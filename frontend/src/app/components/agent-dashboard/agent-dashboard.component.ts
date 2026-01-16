import { Component, OnInit } from '@angular/core';
import { AgentService } from '../../services/agent.service';

@Component({
  selector: 'app-agent-dashboard',
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.scss'],
})
export class AgentDashboardComponent implements OnInit {
  assignments: any[] = [];

  constructor(private agentService: AgentService) {}

  ngOnInit(): void {
    // Get agent ID from session/auth service
    const agentId = 1; // TODO: Get from auth service
    this.loadAssignments(agentId);
  }

  loadAssignments(agentId: number): void {
    this.agentService.getAgentAssignments(agentId).subscribe(
      (data) => {
        this.assignments = data;
      },
      (error) => {
        console.error('Error loading assignments:', error);
      }
    );
  }
}
