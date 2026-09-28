/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * IGNOU BCA Major Project BCSP-064
 * Project Title: AI-Driven IT Service Desk and Automated Ticket Triage System
 * Server-Side Express API Router
 */

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db, User } from './db.ts';
import { triageTicketWithAI, STANDARDIZED_DEPARTMENTS, STANDARDIZED_PRIORITIES } from './aiService.ts';
import { emailService } from './emailService.ts';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bcsp-064-ignou-jwt-secret-key-2026';

// Configurable SLA Target Assumptions (Hours) - Documented as Project Assumptions (Correction 3)
export const SLA_TARGET_HOURS: Record<string, number> = {
  Critical: 4,  // 4 Hours Max
  High: 8,      // 8 Hours Max
  Medium: 24,   // 24 Hours Max
  Low: 48,      // 48 Hours Max
};

// Types for Authenticated Request
export interface AuthUserPayload {
  user_id: number;
  username: string;
  email: string;
  role: 'Customer' | 'Agent';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

// ============================================================================
// Auth & RBAC Middleware
// ============================================================================

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

export function requireRole(allowedRoles: ('Customer' | 'Agent')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated session.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access Denied. Role '${req.user.role}' lacks permissions for this endpoint. Required: [${allowedRoles.join(', ')}]`,
      });
    }
    next();
  };
}

// ============================================================================
// Module 1: Authentication & User Registration
// ============================================================================

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  // Explicitly disallow or ignore 'role' field from public registration
});

router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid registration input', details: parseResult.error.format() });
    }

    const { username, email, password } = parseResult.data;

    // Check duplicate username or email
    const existingUser = await db.findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: 'Username is already registered.' });
    }
    const existingEmail = await db.findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email address is already in use.' });
    }

    // Hash password with bcrypt
    const password_hash = await bcrypt.hash(password, 10);

    // Rule: Public registration MUST NEVER allow Agent creation. Hardcoded strictly to 'Customer'.
    const newUser = await db.createUser({
      username,
      email,
      password_hash,
      role: 'Customer',
    });

    const token = jwt.sign(
      {
        user_id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Customer account registered successfully.',
      access_token: token,
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = await db.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid login credentials.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid login credentials.' });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful.',
      access_token: token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

router.get('/auth/me', authenticateJWT, async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not logged in.' });
  return res.json({ user: req.user });
});

router.get('/departments', async (_req: Request, res: Response) => {
  const depts = await db.getDepartments();
  return res.json({ departments: depts });
});

// ============================================================================
// Module 2: Ticket Ingestion & AI Triage
// ============================================================================

const createTicketSchema = z.object({
  title: z.string().min(5).max(150),
  issue_description: z.string().min(10),
});

router.post('/tickets', authenticateJWT, requireRole(['Customer']), async (req: Request, res: Response) => {
  try {
    const parseResult = createTicketSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.format() });
    }

    const { title, issue_description } = parseResult.data;
    const customerId = req.user!.user_id;

    // 1. Run AI Triage (Algorithm 2)
    const triage = await triageTicketWithAI(issue_description);

    // 2. Map AI Category to department_id
    let department = await db.getDepartmentByName(triage.category);
    if (!department) {
      department = (await db.getDepartmentByName('General')) || (await db.getDepartments())[0];
    }

    // 3. Insert into tickets table
    const ticket = await db.createTicket({
      customer_id: customerId,
      department_id: department.department_id,
      title,
      issue_description,
      ai_category: triage.category,
      ai_priority: triage.priority,
      suggested_solution: triage.suggested_solution,
    });

    // 4. Log into ai_logs table (Strict 1:1 relationship)
    const log = await db.createAILog({
      ticket_id: ticket.ticket_id,
      model_name: triage.model_name,
      raw_response: triage.raw_response,
      tokens_used: triage.tokens_used,
      latency_ms: triage.latency_ms,
      status: triage.status,
    });

    const fullTicket = await db.getTicketById(ticket.ticket_id);

    return res.status(201).json({
      message: 'Ticket successfully ingested and triaged.',
      ticket: fullTicket,
      ai_triage: {
        category: triage.category,
        priority: triage.priority,
        suggested_solution: triage.suggested_solution,
        status: triage.status,
        confidence_score: triage.confidence_score,
        reasoning: triage.reasoning,
        log_id: log.log_id,
      },
    });
  } catch (err: any) {
    console.error('Ticket submission error:', err);
    return res.status(500).json({ error: 'Failed to ingest ticket.' });
  }
});

router.get('/tickets/my', authenticateJWT, requireRole(['Customer']), async (req: Request, res: Response) => {
  const customerId = req.user!.user_id;
  const tickets = await db.getTicketsByCustomer(customerId);
  return res.json({ tickets });
});

router.get('/tickets/:id', authenticateJWT, async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id, 10);
  if (isNaN(ticketId)) return res.status(400).json({ error: 'Invalid ticket ID.' });

  const ticket = await db.getTicketById(ticketId);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

  // RBAC check: Customer can only view their own ticket; Agent can view any ticket
  if (req.user!.role === 'Customer' && ticket.customer_id !== req.user!.user_id) {
    return res.status(403).json({ error: 'Access denied. You do not own this ticket.' });
  }

  const aiLog = await db.getAILogByTicketId(ticketId);

  return res.json({ ticket, ai_log: aiLog });
});

// ============================================================================
// Module 3: Agent Dashboard & Workflow
// ============================================================================

router.get('/agent/tickets', authenticateJWT, requireRole(['Agent']), async (_req: Request, res: Response) => {
  // Returns tickets with Critical First Sorting
  const tickets = await db.getAllTicketsSorted();
  return res.json({ tickets });
});

router.patch('/agent/tickets/:id/override', authenticateJWT, requireRole(['Agent']), async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id, 10);
  const { department_id, ai_priority } = req.body;

  if (isNaN(ticketId) || !department_id || !ai_priority) {
    return res.status(400).json({ error: 'ticket_id, department_id, and ai_priority are required.' });
  }

  if (!STANDARDIZED_PRIORITIES.includes(ai_priority)) {
    return res.status(400).json({ error: `Invalid priority. Must be one of: ${STANDARDIZED_PRIORITIES.join(', ')}` });
  }

  try {
    const updated = await db.overrideTicketClassification(ticketId, Number(department_id), ai_priority);
    if (!updated) return res.status(404).json({ error: 'Ticket not found.' });
    return res.json({ message: 'AI classification manually overridden by agent.', ticket: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Override failed' });
  }
});

router.patch('/agent/tickets/:id/status', authenticateJWT, requireRole(['Agent']), async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id, 10);
  const { status, resolution_notes } = req.body;

  if (isNaN(ticketId) || !['Open', 'In-Progress', 'Resolved'].includes(status)) {
    return res.status(400).json({ error: "Invalid status. Must be 'Open', 'In-Progress', or 'Resolved'." });
  }

  const agentId = req.user!.user_id;
  const currentTicket = await db.getTicketById(ticketId);
  if (!currentTicket) return res.status(404).json({ error: 'Ticket not found.' });

  // Update status
  const updatedTicket = await db.updateTicketStatus(ticketId, status, agentId);

  // If status transitions to 'Resolved', trigger customer email notification (Algorithm 3)
  let emailDispatched = null;
  if (status === 'Resolved' && updatedTicket) {
    emailDispatched = await emailService.sendResolutionNotification({
      ticket_id: updatedTicket.ticket_id,
      title: updatedTicket.title,
      customer_name: updatedTicket.customer_username,
      customer_email: updatedTicket.customer_email,
      department_name: updatedTicket.department_name,
      resolution_solution: resolution_notes || updatedTicket.suggested_solution || 'Issue resolved by support agent.',
      resolved_by_agent: req.user!.username,
    });
  }

  return res.json({
    message: `Ticket status updated to '${status}'.`,
    ticket: updatedTicket,
    email_notification: emailDispatched,
  });
});

router.get('/agent/ai-logs', authenticateJWT, requireRole(['Agent']), async (_req: Request, res: Response) => {
  const logs = await db.getAILogs();
  return res.json({ logs });
});

router.get('/agent/emails', authenticateJWT, requireRole(['Agent']), async (_req: Request, res: Response) => {
  const emails = emailService.getRecentEmails();
  return res.json({ emails });
});

// ============================================================================
// Module 4: Reporting & Analytics
// ============================================================================

router.get('/analytics/overview', authenticateJWT, requireRole(['Agent']), async (_req: Request, res: Response) => {
  const tickets = await db.getAllTicketsSorted();
  const total = tickets.length;
  const open = tickets.filter((t) => t.status === 'Open').length;
  const inProgress = tickets.filter((t) => t.status === 'In-Progress').length;
  const resolved = tickets.filter((t) => t.status === 'Resolved');
  const critical = tickets.filter((t) => t.ai_priority === 'Critical').length;

  // Calculate Mean Time to Resolution (MTTR) in Hours
  let totalResolutionHours = 0;
  resolved.forEach((t) => {
    if (t.resolved_at && t.created_at) {
      const diffMs = new Date(t.resolved_at).getTime() - new Date(t.created_at).getTime();
      totalResolutionHours += Math.max(0, diffMs / (1000 * 60 * 60));
    }
  });

  const mttrHours = resolved.length > 0 ? Number((totalResolutionHours / resolved.length).toFixed(1)) : 0;

  return res.json({
    metrics: {
      total_tickets: total,
      open_tickets: open,
      in_progress_tickets: inProgress,
      resolved_tickets: resolved.length,
      critical_tickets: critical,
      mttr_hours: mttrHours,
    },
  });
});

router.get('/analytics/volume-trend', authenticateJWT, requireRole(['Agent']), async (_req: Request, res: Response) => {
  const tickets = await db.getAllTicketsSorted();
  // Aggregate tickets by date
  const countsByDate: Record<string, number> = {};
  tickets.forEach((t) => {
    const dateStr = t.created_at.split('T')[0];
    countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
  });

  const data = Object.keys(countsByDate)
    .sort()
    .map((date) => ({
      date,
      count: countsByDate[date],
    }));

  return res.json({ volume_trend: data });
});

router.get('/analytics/department-load', authenticateJWT, requireRole(['Agent']), async (_req: Request, res: Response) => {
  const tickets = await db.getAllTicketsSorted();
  const counts: Record<string, number> = {};

  STANDARDIZED_DEPARTMENTS.forEach((dept) => {
    counts[dept] = 0;
  });

  tickets.forEach((t) => {
    const dept = t.department_name || t.ai_category || 'General';
    counts[dept] = (counts[dept] || 0) + 1;
  });

  const data = Object.entries(counts).map(([department, count]) => ({
    department,
    tickets: count,
  }));

  return res.json({ department_load: data });
});

router.get('/analytics/priority-distribution', authenticateJWT, requireRole(['Agent']), async (_req: Request, res: Response) => {
  const tickets = await db.getAllTicketsSorted();
  const counts: Record<string, number> = {
    Low: 0,
    Medium: 0,
    High: 0,
    Critical: 0,
  };

  tickets.forEach((t) => {
    if (counts[t.ai_priority] !== undefined) {
      counts[t.ai_priority]++;
    }
  });

  const data = Object.entries(counts).map(([priority, count]) => ({
    priority,
    count,
  }));

  return res.json({ priority_distribution: data });
});

// Dedicated Agent Performance Endpoint (Correction 4 & 6)
router.get('/analytics/agent-performance', authenticateJWT, requireRole(['Agent']), async (_req: Request, res: Response) => {
  const agents = await db.getAgents();
  const tickets = await db.getAllTicketsSorted();
  const resolvedTickets = tickets.filter((t) => t.status === 'Resolved' && t.resolved_by_agent_id);

  const performanceList = agents.map((agent) => {
    const agentResolved = resolvedTickets.filter((t) => t.resolved_by_agent_id === agent.user_id);
    const total_resolved_tickets = agentResolved.length;

    let totalResolutionHours = 0;
    let compliantCount = 0;

    agentResolved.forEach((t) => {
      if (t.resolved_at && t.created_at) {
        const diffHours = (new Date(t.resolved_at).getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60);
        totalResolutionHours += Math.max(0, diffHours);

        // Check configurable SLA target assumption
        const targetHours = SLA_TARGET_HOURS[t.ai_priority] || 24;
        if (diffHours <= targetHours) {
          compliantCount++;
        }
      }
    });

    const average_mttr_hours = total_resolved_tickets > 0 ? Number((totalResolutionHours / total_resolved_tickets).toFixed(1)) : 0;
    const sla_compliance_rate = total_resolved_tickets > 0 ? Number(((compliantCount / total_resolved_tickets) * 100).toFixed(0)) : 100;

    return {
      agent_id: agent.user_id,
      username: agent.username,
      email: agent.email,
      total_resolved_tickets, // Accurately named per Requirement 6
      average_mttr_hours,
      sla_compliance_rate,
      sla_target_assumptions: SLA_TARGET_HOURS,
    };
  });

  return res.json({ agent_performance: performanceList });
});

export default router;
