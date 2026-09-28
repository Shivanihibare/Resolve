/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  user_id: number;
  username: string;
  email: string;
  role: 'Customer' | 'Agent';
}

export interface Department {
  department_id: number;
  department_name: string;
  description: string;
  created_at: string;
}

export interface Ticket {
  ticket_id: number;
  customer_id: number;
  customer_username: string;
  customer_email: string;
  department_id: number;
  department_name: string;
  resolved_by_agent_id: number | null;
  resolved_by_username?: string | null;
  title: string;
  issue_description: string;
  ai_category: string;
  ai_priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In-Progress' | 'Resolved';
  suggested_solution: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface AILog {
  log_id: number;
  ticket_id: number;
  ticket_title?: string;
  model_name: string;
  raw_response: string;
  tokens_used: number;
  latency_ms: number;
  status: 'SUCCESS' | 'FALLBACK';
  created_at: string;
}

export interface SentEmail {
  id: string;
  ticket_id: number;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  html_content: string;
  sent_at: string;
  delivery_status: string;
}

export interface OverviewMetrics {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  critical_tickets: number;
  mttr_hours: number;
}

export interface AgentPerformanceMetric {
  agent_id: number;
  username: string;
  email: string;
  total_resolved_tickets: number;
  average_mttr_hours: number;
  sla_compliance_rate: number;
  sla_target_assumptions: Record<string, number>;
}
