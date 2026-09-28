/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * IGNOU BCA Major Project BCSP-064
 * Project Title: AI-Driven IT Service Desk and Automated Ticket Triage System
 * Database Repository Module
 * 
 * Supports two runtime database modes configured via environment:
 * 1. DATABASE_MODE=memory (Default/Demo fallback): High-fidelity in-memory store
 * 2. DATABASE_MODE=mysql  : Real relational MySQL persistence via mysql2 connection pool
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

export interface User {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  role: 'Customer' | 'Agent';
  created_at: string;
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
  department_id: number;
  resolved_by_agent_id: number | null;
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
  ticket_id: number; // 1:1 Strict UNIQUE foreign key
  model_name: string;
  raw_response: string;
  tokens_used: number;
  latency_ms: number;
  status: 'SUCCESS' | 'FALLBACK';
  created_at: string;
}

export interface TicketWithDetails extends Ticket {
  customer_username: string;
  customer_email: string;
  department_name: string;
  resolved_by_username?: string | null;
}

export interface IDatabaseStore {
  findUserByUsername(username: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(userId: number): Promise<User | null>;
  getUsersByRole(role: 'Customer' | 'Agent'): Promise<User[]>;
  getAgents(): Promise<User[]>;
  createUser(data: { username: string; email: string; password_hash: string; role: 'Customer' | 'Agent' }): Promise<User>;
  getDepartments(): Promise<Department[]>;
  getDepartmentByName(name: string): Promise<Department | null>;
  getDepartmentById(id: number): Promise<Department | null>;
  createTicket(data: {
    customer_id: number;
    department_id: number;
    title: string;
    issue_description: string;
    ai_category: string;
    ai_priority: 'Low' | 'Medium' | 'High' | 'Critical';
    suggested_solution: string | null;
  }): Promise<Ticket>;
  createAILog(data: {
    ticket_id: number;
    model_name: string;
    raw_response: string;
    tokens_used: number;
    latency_ms: number;
    status: 'SUCCESS' | 'FALLBACK';
  }): Promise<AILog>;
  getTicketById(ticketId: number): Promise<TicketWithDetails | null>;
  getTicketsByCustomer(customerId: number): Promise<TicketWithDetails[]>;
  getAllTicketsSorted(): Promise<TicketWithDetails[]>;
  updateTicketStatus(
    ticketId: number,
    newStatus: 'Open' | 'In-Progress' | 'Resolved',
    agentId: number
  ): Promise<TicketWithDetails | null>;
  overrideTicketClassification(
    ticketId: number,
    departmentId: number,
    priority: 'Low' | 'Medium' | 'High' | 'Critical'
  ): Promise<TicketWithDetails | null>;
  getAILogs(): Promise<(AILog & { ticket_title?: string })[]>;
  getAILogByTicketId(ticketId: number): Promise<AILog | null>;
  users: User[];
}

// In-Memory Database store ensuring immediate execution without requiring external OS services
export class DatabaseStore implements IDatabaseStore {
  public departments: Department[] = [];
  public users: User[] = [];
  public tickets: Ticket[] = [];
  public ai_logs: AILog[] = [];
  private nextUserId = 1;
  private nextTicketId = 1;
  private nextLogId = 1;

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    const defaultPasswordHash = bcrypt.hashSync('student123', 10);
    const agentPasswordHash = bcrypt.hashSync('agent123', 10);

    // 1. Departments (Standardized: Network, Hardware, Software, Security, Account Access, General)
    this.departments = [
      { department_id: 1, department_name: 'Network', description: 'Routers, switches, VPN, IP addressing, DNS, and physical connectivity', created_at: new Date(Date.now() - 86400000 * 30).toISOString() },
      { department_id: 2, department_name: 'Hardware', description: 'Laptops, desktops, monitors, docking stations, and peripherals', created_at: new Date(Date.now() - 86400000 * 30).toISOString() },
      { department_id: 3, department_name: 'Software', description: 'Operating systems, productivity suites, specialized ERP/CRM tools', created_at: new Date(Date.now() - 86400000 * 30).toISOString() },
      { department_id: 4, department_name: 'Security', description: 'Malware alerts, phishing reports, certificates, and access control', created_at: new Date(Date.now() - 86400000 * 30).toISOString() },
      { department_id: 5, department_name: 'Account Access', description: 'SSO credentials, multi-factor authentication, account lockouts, password resets', created_at: new Date(Date.now() - 86400000 * 30).toISOString() },
      { department_id: 6, department_name: 'General', description: 'Uncategorized requests, IT equipment inquiries, and general assistance', created_at: new Date(Date.now() - 86400000 * 30).toISOString() },
    ];

    // 2. Users (Customer accounts and Admin-provisioned Agent accounts)
    this.users = [
      { user_id: 1, username: 'student_rahul', email: 'rahul@ignou.ac.in', password_hash: defaultPasswordHash, role: 'Customer', created_at: new Date(Date.now() - 86400000 * 10).toISOString() },
      { user_id: 2, username: 'faculty_anita', email: 'anita@ignou.ac.in', password_hash: defaultPasswordHash, role: 'Customer', created_at: new Date(Date.now() - 86400000 * 8).toISOString() },
      { user_id: 3, username: 'agent_smith', email: 'smith@servicedesk.org', password_hash: agentPasswordHash, role: 'Agent', created_at: new Date(Date.now() - 86400000 * 20).toISOString() },
      { user_id: 4, username: 'agent_kumar', email: 'kumar@servicedesk.org', password_hash: agentPasswordHash, role: 'Agent', created_at: new Date(Date.now() - 86400000 * 15).toISOString() },
      { user_id: 5, username: 'agent_patel', email: 'patel@servicedesk.org', password_hash: agentPasswordHash, role: 'Agent', created_at: new Date(Date.now() - 86400000 * 12).toISOString() },
    ];
    this.nextUserId = 6;

    // 3. Historical Tickets with realistic timestamps for MTTR calculation
    const now = Date.now();
    this.tickets = [
      {
        ticket_id: 1,
        customer_id: 1,
        department_id: 1,
        resolved_by_agent_id: 3,
        title: 'Core switch offline in Lab 4',
        issue_description: 'Entire computer science laboratory 4 lost connection to the internal subnet and gateway during practical session.',
        ai_category: 'Network',
        ai_priority: 'Critical',
        status: 'Resolved',
        suggested_solution: 'Power cycled edge switch and replaced faulty SFP+ fiber transceiver module on Port 24.',
        created_at: new Date(now - 3600000 * 48).toISOString(),
        updated_at: new Date(now - 3600000 * 45).toISOString(),
        resolved_at: new Date(now - 3600000 * 45).toISOString(), // 3 hours resolution
      },
      {
        ticket_id: 2,
        customer_id: 2,
        department_id: 4,
        resolved_by_agent_id: 3,
        title: 'Suspicious phishing email targeting university faculty',
        issue_description: 'Received email claiming urgent payroll update with link to external non-university domain asking for credentials.',
        ai_category: 'Security',
        ai_priority: 'High',
        status: 'Resolved',
        suggested_solution: 'Quarantined sender domain at mail gateway, invalidated compromised tokens, and flushed malicious rule.',
        created_at: new Date(now - 3600000 * 36).toISOString(),
        updated_at: new Date(now - 3600000 * 30).toISOString(),
        resolved_at: new Date(now - 3600000 * 30).toISOString(), // 6 hours resolution
      },
      {
        ticket_id: 3,
        customer_id: 1,
        department_id: 5,
        resolved_by_agent_id: 4,
        title: 'Student portal account locked after invalid attempts',
        issue_description: 'Unable to login to portal for BCA assignment submission due to account lockout.',
        ai_category: 'Account Access',
        ai_priority: 'Medium',
        status: 'Resolved',
        suggested_solution: 'Verified student enrollment ID and triggered self-service password reset link.',
        created_at: new Date(now - 3600000 * 24).toISOString(),
        updated_at: new Date(now - 3600000 * 22).toISOString(),
        resolved_at: new Date(now - 3600000 * 22).toISOString(), // 2 hours resolution
      },
      {
        ticket_id: 4,
        customer_id: 2,
        department_id: 3,
        resolved_by_agent_id: 4,
        title: 'Compiler error in Turbo C++ / VS Code lab environment',
        issue_description: 'Students experiencing segmentation faults in C compilation lab due to corrupted PATH environment variable.',
        ai_category: 'Software',
        ai_priority: 'Medium',
        status: 'In-Progress',
        suggested_solution: 'Reinstall GCC MinGW toolchain and reconfigure system PATH environment variable.',
        created_at: new Date(now - 3600000 * 10).toISOString(),
        updated_at: new Date(now - 3600000 * 2).toISOString(),
        resolved_at: null,
      },
      {
        ticket_id: 5,
        customer_id: 1,
        department_id: 1,
        resolved_by_agent_id: null,
        title: 'Intermittent Wi-Fi signal in library study cubicles',
        issue_description: 'Signals drop every 10 minutes when accessing electronic database search.',
        ai_category: 'Network',
        ai_priority: 'Low',
        status: 'Open',
        suggested_solution: 'Inspect wireless access point channel interference and perform AP firmware reboot.',
        created_at: new Date(now - 3600000 * 4).toISOString(),
        updated_at: new Date(now - 3600000 * 4).toISOString(),
        resolved_at: null,
      },
      {
        ticket_id: 6,
        customer_id: 2,
        department_id: 3,
        resolved_by_agent_id: null,
        title: 'Campus ERP database connection pool exhausted',
        issue_description: 'Central administrative database server unresponsive. HTTP 500 error returned across student registration desks.',
        ai_category: 'Software',
        ai_priority: 'Critical',
        status: 'Open',
        suggested_solution: 'Check active database thread pool, restart database daemon, and kill blocking deadlock queries.',
        created_at: new Date(now - 3600000 * 1).toISOString(),
        updated_at: new Date(now - 3600000 * 1).toISOString(),
        resolved_at: null,
      },
    ];
    this.nextTicketId = 7;

    // 4. Corresponding 1:1 AI Audit Logs
    this.ai_logs = [
      {
        log_id: 1,
        ticket_id: 1,
        model_name: 'gemini-2.5-flash',
        raw_response: JSON.stringify({ category: 'Network', priority: 'Critical', suggested_solution: 'Power cycle edge switch and verify link carrier status.', confidence_score: 0.98, reasoning: 'Outage affecting entire lab subnet' }),
        tokens_used: 184,
        latency_ms: 820,
        status: 'SUCCESS',
        created_at: new Date(now - 3600000 * 48).toISOString(),
      },
      {
        log_id: 2,
        ticket_id: 2,
        model_name: 'gemini-2.5-flash',
        raw_response: JSON.stringify({ category: 'Security', priority: 'High', suggested_solution: 'Block sender domain and alert faculty members.', confidence_score: 0.95, reasoning: 'Credential harvesting attack detected' }),
        tokens_used: 162,
        latency_ms: 740,
        status: 'SUCCESS',
        created_at: new Date(now - 3600000 * 36).toISOString(),
      },
      {
        log_id: 3,
        ticket_id: 3,
        model_name: 'gemini-2.5-flash',
        raw_response: JSON.stringify({ category: 'Account Access', priority: 'Medium', suggested_solution: 'Reset account lock flag in identity directory.', confidence_score: 0.99, reasoning: 'Standard user authentication lockout' }),
        tokens_used: 140,
        latency_ms: 610,
        status: 'SUCCESS',
        created_at: new Date(now - 3600000 * 24).toISOString(),
      },
      {
        log_id: 4,
        ticket_id: 4,
        model_name: 'gemini-2.5-flash',
        raw_response: JSON.stringify({ category: 'Software', priority: 'Medium', suggested_solution: 'Reconfigure PATH variable and reinstall compiler.', confidence_score: 0.91, reasoning: 'IDE and build tool environment error' }),
        tokens_used: 178,
        latency_ms: 890,
        status: 'SUCCESS',
        created_at: new Date(now - 3600000 * 10).toISOString(),
      },
      {
        log_id: 5,
        ticket_id: 5,
        model_name: 'gemini-2.5-flash',
        raw_response: JSON.stringify({ category: 'Network', priority: 'Low', suggested_solution: 'Check AP beacon and channel congestion.', confidence_score: 0.88, reasoning: 'Non-critical wireless interference in recreational zone' }),
        tokens_used: 155,
        latency_ms: 680,
        status: 'SUCCESS',
        created_at: new Date(now - 3600000 * 4).toISOString(),
      },
      {
        log_id: 6,
        ticket_id: 6,
        model_name: 'gemini-2.5-flash',
        raw_response: JSON.stringify({ category: 'Software', priority: 'Critical', suggested_solution: 'Check active database thread pool, restart database daemon, and kill blocking deadlock queries.', confidence_score: 0.97, reasoning: 'Campus wide server outage' }),
        tokens_used: 210,
        latency_ms: 940,
        status: 'SUCCESS',
        created_at: new Date(now - 3600000 * 1).toISOString(),
      },
    ];
    this.nextLogId = 7;
  }

  // User Operations
  public async findUserByUsername(username: string): Promise<User | null> {
    return this.users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
  }

  public async findUserByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public async findUserById(userId: number): Promise<User | null> {
    return this.users.find((u) => u.user_id === userId) || null;
  }

  public async getUsersByRole(role: 'Customer' | 'Agent'): Promise<User[]> {
    return this.users.filter((u) => u.role === role);
  }

  public async getAgents(): Promise<User[]> {
    return this.getUsersByRole('Agent');
  }

  public async createUser(data: { username: string; email: string; password_hash: string; role: 'Customer' | 'Agent' }): Promise<User> {
    const user: User = {
      user_id: this.nextUserId++,
      username: data.username,
      email: data.email,
      password_hash: data.password_hash,
      role: data.role,
      created_at: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  // Department Operations
  public async getDepartments(): Promise<Department[]> {
    return [...this.departments];
  }

  public async getDepartmentByName(name: string): Promise<Department | null> {
    return this.departments.find((d) => d.department_name.toLowerCase() === name.toLowerCase()) || null;
  }

  public async getDepartmentById(id: number): Promise<Department | null> {
    return this.departments.find((d) => d.department_id === id) || null;
  }

  // Ticket Operations
  public async createTicket(data: {
    customer_id: number;
    department_id: number;
    title: string;
    issue_description: string;
    ai_category: string;
    ai_priority: 'Low' | 'Medium' | 'High' | 'Critical';
    suggested_solution: string | null;
  }): Promise<Ticket> {
    const ticket: Ticket = {
      ticket_id: this.nextTicketId++,
      customer_id: data.customer_id,
      department_id: data.department_id,
      resolved_by_agent_id: null,
      title: data.title,
      issue_description: data.issue_description,
      ai_category: data.ai_category,
      ai_priority: data.ai_priority,
      status: 'Open',
      suggested_solution: data.suggested_solution,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resolved_at: null,
    };
    this.tickets.push(ticket);
    return ticket;
  }

  public async createAILog(data: {
    ticket_id: number;
    model_name: string;
    raw_response: string;
    tokens_used: number;
    latency_ms: number;
    status: 'SUCCESS' | 'FALLBACK';
  }): Promise<AILog> {
    // 1:1 Enforced: check if log already exists
    const existing = this.ai_logs.find((l) => l.ticket_id === data.ticket_id);
    if (existing) {
      throw new Error(`Integrity Error: Ticket ${data.ticket_id} already possesses a 1:1 AI log entry.`);
    }

    const log: AILog = {
      log_id: this.nextLogId++,
      ticket_id: data.ticket_id,
      model_name: data.model_name,
      raw_response: data.raw_response,
      tokens_used: data.tokens_used,
      latency_ms: data.latency_ms,
      status: data.status,
      created_at: new Date().toISOString(),
    };
    this.ai_logs.push(log);
    return log;
  }

  public async getTicketById(ticketId: number): Promise<TicketWithDetails | null> {
    const ticket = this.tickets.find((t) => t.ticket_id === ticketId);
    if (!ticket) return null;
    return this.enrichTicket(ticket);
  }

  public async getTicketsByCustomer(customerId: number): Promise<TicketWithDetails[]> {
    const filtered = this.tickets.filter((t) => t.customer_id === customerId);
    return Promise.all(filtered.map((t) => this.enrichTicket(t)));
  }

  public async getAllTicketsSorted(): Promise<TicketWithDetails[]> {
    // Critical First Sorting Algorithm
    const priorityWeight: Record<string, number> = {
      Critical: 1,
      High: 2,
      Medium: 3,
      Low: 4,
    };

    const sorted = [...this.tickets].sort((a, b) => {
      const weightA = priorityWeight[a.ai_priority] || 5;
      const weightB = priorityWeight[b.ai_priority] || 5;
      if (weightA !== weightB) return weightA - weightB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return Promise.all(sorted.map((t) => this.enrichTicket(t)));
  }

  public async updateTicketStatus(
    ticketId: number,
    newStatus: 'Open' | 'In-Progress' | 'Resolved',
    agentId: number
  ): Promise<TicketWithDetails | null> {
    const ticket = this.tickets.find((t) => t.ticket_id === ticketId);
    if (!ticket) return null;

    ticket.status = newStatus;
    ticket.updated_at = new Date().toISOString();

    if (newStatus === 'Resolved') {
      ticket.resolved_at = new Date().toISOString();
      ticket.resolved_by_agent_id = agentId;
    } else if (newStatus === 'Open') {
      ticket.resolved_at = null;
      ticket.resolved_by_agent_id = null;
    } else if (newStatus === 'In-Progress') {
      ticket.resolved_by_agent_id = agentId;
    }

    return this.enrichTicket(ticket);
  }

  public async overrideTicketClassification(
    ticketId: number,
    departmentId: number,
    priority: 'Low' | 'Medium' | 'High' | 'Critical'
  ): Promise<TicketWithDetails | null> {
    const ticket = this.tickets.find((t) => t.ticket_id === ticketId);
    if (!ticket) return null;

    const dept = await this.getDepartmentById(departmentId);
    if (!dept) throw new Error('Invalid department ID');

    ticket.department_id = departmentId;
    ticket.ai_category = dept.department_name;
    ticket.ai_priority = priority;
    ticket.updated_at = new Date().toISOString();

    return this.enrichTicket(ticket);
  }

  public async getAILogs(): Promise<(AILog & { ticket_title?: string })[]> {
    return this.ai_logs.map((log) => {
      const ticket = this.tickets.find((t) => t.ticket_id === log.ticket_id);
      return {
        ...log,
        ticket_title: ticket ? ticket.title : 'Deleted Ticket',
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async getAILogByTicketId(ticketId: number): Promise<AILog | null> {
    return this.ai_logs.find((l) => l.ticket_id === ticketId) || null;
  }

  private async enrichTicket(ticket: Ticket): Promise<TicketWithDetails> {
    const customer = this.users.find((u) => u.user_id === ticket.customer_id);
    const department = this.departments.find((d) => d.department_id === ticket.department_id);
    const agent = ticket.resolved_by_agent_id ? this.users.find((u) => u.user_id === ticket.resolved_by_agent_id) : null;

    return {
      ...ticket,
      customer_username: customer ? customer.username : 'Unknown',
      customer_email: customer ? customer.email : 'Unknown',
      department_name: department ? department.department_name : 'General',
      resolved_by_username: agent ? agent.username : null,
    };
  }
}

// Real MySQL Database Store implementation using mysql2 connection pool
export class MySQLDatabaseStore implements IDatabaseStore {
  private pool: mysql.Pool;

  constructor() {
    const host = process.env.MYSQL_HOST || 'localhost';
    const port = Number(process.env.MYSQL_PORT) || 3306;
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || process.env.MYSQL_PASS || '';
    const database = process.env.MYSQL_DATABASE || 'service_desk_db';

    this.pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  public get users(): User[] {
    throw new Error('Direct synchronous array access to users is not supported in MySQL mode. Use async getAgents() or getUsersByRole().');
  }

  public async findUserByUsername(username: string): Promise<User | null> {
    const [rows] = await this.pool.execute<any[]>(
      'SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1',
      [username]
    );
    if (rows.length === 0) return null;
    return rows[0] as User;
  }

  public async findUserByEmail(email: string): Promise<User | null> {
    const [rows] = await this.pool.execute<any[]>(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
      [email]
    );
    if (rows.length === 0) return null;
    return rows[0] as User;
  }

  public async findUserById(userId: number): Promise<User | null> {
    const [rows] = await this.pool.execute<any[]>(
      'SELECT * FROM users WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (rows.length === 0) return null;
    return rows[0] as User;
  }

  public async getUsersByRole(role: 'Customer' | 'Agent'): Promise<User[]> {
    const [rows] = await this.pool.execute<any[]>(
      'SELECT * FROM users WHERE role = ?',
      [role]
    );
    return rows as User[];
  }

  public async getAgents(): Promise<User[]> {
    return this.getUsersByRole('Agent');
  }

  public async createUser(data: { username: string; email: string; password_hash: string; role: 'Customer' | 'Agent' }): Promise<User> {
    const [result] = await this.pool.execute<mysql.ResultSetHeader>(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [data.username, data.email, data.password_hash, data.role]
    );
    const user = await this.findUserById(result.insertId);
    if (!user) throw new Error('Failed to create user record in MySQL.');
    return user;
  }

  public async getDepartments(): Promise<Department[]> {
    const [rows] = await this.pool.execute<any[]>('SELECT * FROM departments');
    return rows as Department[];
  }

  public async getDepartmentByName(name: string): Promise<Department | null> {
    const [rows] = await this.pool.execute<any[]>(
      'SELECT * FROM departments WHERE LOWER(department_name) = LOWER(?) LIMIT 1',
      [name]
    );
    if (rows.length === 0) return null;
    return rows[0] as Department;
  }

  public async getDepartmentById(id: number): Promise<Department | null> {
    const [rows] = await this.pool.execute<any[]>(
      'SELECT * FROM departments WHERE department_id = ? LIMIT 1',
      [id]
    );
    if (rows.length === 0) return null;
    return rows[0] as Department;
  }

  public async createTicket(data: {
    customer_id: number;
    department_id: number;
    title: string;
    issue_description: string;
    ai_category: string;
    ai_priority: 'Low' | 'Medium' | 'High' | 'Critical';
    suggested_solution: string | null;
  }): Promise<Ticket> {
    const [result] = await this.pool.execute<mysql.ResultSetHeader>(
      `INSERT INTO tickets 
       (customer_id, department_id, title, issue_description, ai_category, ai_priority, status, suggested_solution, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, 'Open', ?, NOW(), NOW())`,
      [
        data.customer_id,
        data.department_id,
        data.title,
        data.issue_description,
        data.ai_category,
        data.ai_priority,
        data.suggested_solution,
      ]
    );

    const [rows] = await this.pool.execute<any[]>(
      'SELECT * FROM tickets WHERE ticket_id = ? LIMIT 1',
      [result.insertId]
    );
    return rows[0] as Ticket;
  }

  public async createAILog(data: {
    ticket_id: number;
    model_name: string;
    raw_response: string;
    tokens_used: number;
    latency_ms: number;
    status: 'SUCCESS' | 'FALLBACK';
  }): Promise<AILog> {
    // Check 1:1 uniqueness constraint
    const [existing] = await this.pool.execute<any[]>(
      'SELECT log_id FROM ai_logs WHERE ticket_id = ? LIMIT 1',
      [data.ticket_id]
    );
    if (existing.length > 0) {
      throw new Error(`Integrity Error: Ticket ${data.ticket_id} already possesses a 1:1 AI log entry.`);
    }

    const [result] = await this.pool.execute<mysql.ResultSetHeader>(
      `INSERT INTO ai_logs 
       (ticket_id, model_name, raw_response, tokens_used, latency_ms, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        data.ticket_id,
        data.model_name,
        data.raw_response,
        data.tokens_used,
        data.latency_ms,
        data.status,
      ]
    );

    const [rows] = await this.pool.execute<any[]>(
      'SELECT * FROM ai_logs WHERE log_id = ? LIMIT 1',
      [result.insertId]
    );
    return rows[0] as AILog;
  }

  public async getTicketById(ticketId: number): Promise<TicketWithDetails | null> {
    const query = `
      SELECT 
        t.*,
        u_cust.username AS customer_username,
        u_cust.email AS customer_email,
        d.department_name,
        u_agent.username AS resolved_by_username
      FROM tickets t
      LEFT JOIN users u_cust ON t.customer_id = u_cust.user_id
      LEFT JOIN departments d ON t.department_id = d.department_id
      LEFT JOIN users u_agent ON t.resolved_by_agent_id = u_agent.user_id
      WHERE t.ticket_id = ?
      LIMIT 1
    `;
    const [rows] = await this.pool.execute<any[]>(query, [ticketId]);
    if (rows.length === 0) return null;
    return rows[0] as TicketWithDetails;
  }

  public async getTicketsByCustomer(customerId: number): Promise<TicketWithDetails[]> {
    const query = `
      SELECT 
        t.*,
        u_cust.username AS customer_username,
        u_cust.email AS customer_email,
        d.department_name,
        u_agent.username AS resolved_by_username
      FROM tickets t
      LEFT JOIN users u_cust ON t.customer_id = u_cust.user_id
      LEFT JOIN departments d ON t.department_id = d.department_id
      LEFT JOIN users u_agent ON t.resolved_by_agent_id = u_agent.user_id
      WHERE t.customer_id = ?
      ORDER BY t.created_at DESC
    `;
    const [rows] = await this.pool.execute<any[]>(query, [customerId]);
    return rows as TicketWithDetails[];
  }

  public async getAllTicketsSorted(): Promise<TicketWithDetails[]> {
    // Critical-First Sorting SQL Query
    const query = `
      SELECT 
        t.*,
        u_cust.username AS customer_username,
        u_cust.email AS customer_email,
        d.department_name,
        u_agent.username AS resolved_by_username
      FROM tickets t
      LEFT JOIN users u_cust ON t.customer_id = u_cust.user_id
      LEFT JOIN departments d ON t.department_id = d.department_id
      LEFT JOIN users u_agent ON t.resolved_by_agent_id = u_agent.user_id
      ORDER BY 
        FIELD(t.ai_priority, 'Critical', 'High', 'Medium', 'Low'),
        t.created_at DESC
    `;
    const [rows] = await this.pool.execute<any[]>(query);
    return rows as TicketWithDetails[];
  }

  public async updateTicketStatus(
    ticketId: number,
    newStatus: 'Open' | 'In-Progress' | 'Resolved',
    agentId: number
  ): Promise<TicketWithDetails | null> {
    if (newStatus === 'Resolved') {
      await this.pool.execute(
        'UPDATE tickets SET status = ?, updated_at = NOW(), resolved_at = NOW(), resolved_by_agent_id = ? WHERE ticket_id = ?',
        [newStatus, agentId, ticketId]
      );
    } else if (newStatus === 'Open') {
      await this.pool.execute(
        'UPDATE tickets SET status = ?, updated_at = NOW(), resolved_at = NULL, resolved_by_agent_id = NULL WHERE ticket_id = ?',
        [newStatus, ticketId]
      );
    } else {
      await this.pool.execute(
        'UPDATE tickets SET status = ?, updated_at = NOW(), resolved_by_agent_id = ? WHERE ticket_id = ?',
        [newStatus, agentId, ticketId]
      );
    }

    return this.getTicketById(ticketId);
  }

  public async overrideTicketClassification(
    ticketId: number,
    departmentId: number,
    priority: 'Low' | 'Medium' | 'High' | 'Critical'
  ): Promise<TicketWithDetails | null> {
    const dept = await this.getDepartmentById(departmentId);
    if (!dept) throw new Error('Invalid department ID');

    await this.pool.execute(
      'UPDATE tickets SET department_id = ?, ai_category = ?, ai_priority = ?, updated_at = NOW() WHERE ticket_id = ?',
      [departmentId, dept.department_name, priority, ticketId]
    );

    return this.getTicketById(ticketId);
  }

  public async getAILogs(): Promise<(AILog & { ticket_title?: string })[]> {
    const query = `
      SELECT 
        l.*,
        t.title AS ticket_title
      FROM ai_logs l
      LEFT JOIN tickets t ON l.ticket_id = t.ticket_id
      ORDER BY l.created_at DESC
    `;
    const [rows] = await this.pool.execute<any[]>(query);
    return rows as (AILog & { ticket_title?: string })[];
  }

  public async getAILogByTicketId(ticketId: number): Promise<AILog | null> {
    const [rows] = await this.pool.execute<any[]>(
      'SELECT * FROM ai_logs WHERE ticket_id = ? LIMIT 1',
      [ticketId]
    );
    if (rows.length === 0) return null;
    return rows[0] as AILog;
  }
}

// Select active repository implementation based on DATABASE_MODE
const databaseMode = (process.env.DATABASE_MODE || 'memory').toLowerCase();
let activeStore: IDatabaseStore;

if (databaseMode === 'mysql') {
  console.log('[Database] Initializing MySQL Database Repository (DATABASE_MODE=mysql)...');
  activeStore = new MySQLDatabaseStore();
} else {
  console.log('[Database] Initializing In-Memory Database Repository (DATABASE_MODE=memory)...');
  activeStore = new DatabaseStore();
}

export const db = activeStore;
