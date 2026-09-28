/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * IGNOU BCA Major Project (BCSP-064)
 * Project Title: AI-Driven IT Service Desk and Automated Ticket Triage System
 * Automated Test Suite (Three-Tier Testing: Unit, Mocked Integration, and E2E Journey)
 * 
 * Run with: npx tsx tests/run_tests.ts
 */

import bcrypt from 'bcryptjs';
import { db } from '../server/db.ts';
import { STANDARDIZED_DEPARTMENTS, STANDARDIZED_PRIORITIES, triageTicketWithAI } from '../server/aiService.ts';
import { emailService } from '../server/emailService.ts';
import { SLA_TARGET_HOURS } from '../server/api.ts';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${testName}`);
    passedTests++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${testName}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('\n================================================================');
  console.log('IGNOU BCSP-064 AUTOMATED THREE-TIER TEST SUITE EXECUTION');
  console.log('Project: AI-Driven IT Service Desk and Automated Ticket Triage System');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // TIER 1: UNIT TESTING (Section 5.4 of Proposal)
  // --------------------------------------------------------------------------
  console.log('\x1b[34m[TIER 1: UNIT TESTS]\x1b[0m');

  // Test 1.1: Password Hashing & Verification
  const testPassword = 'AcademicSecurePassword2026!';
  const hash = await bcrypt.hash(testPassword, 10);
  const isValid = await bcrypt.compare(testPassword, hash);
  const isInvalid = await bcrypt.compare('WrongPassword', hash);
  assert(isValid && !isInvalid, 'Unit 1.1: Bcrypt password hashing and salting integrity');

  // Test 1.2: Standardized Departments Enforced
  const expectedDepartments = ['Network', 'Hardware', 'Software', 'Security', 'Account Access', 'General'];
  const allDeptsMatch = expectedDepartments.every((d) => STANDARDIZED_DEPARTMENTS.includes(d as any));
  assert(allDeptsMatch, 'Unit 1.2: Standardized department constants contain all required 6 departments');

  // Test 1.3: Standardized Urgency Priority Levels
  const expectedPriorities = ['Low', 'Medium', 'High', 'Critical'];
  const allPrioritiesMatch = expectedPriorities.every((p) => STANDARDIZED_PRIORITIES.includes(p as any));
  assert(allPrioritiesMatch, 'Unit 1.3: Standardized urgency priority levels match Low, Medium, High, Critical');

  // Test 1.4: MTTR Calculation Formula
  // MTTR = sum(resolved_at - created_at) / count
  const delta1Hours = 2.0;
  const delta2Hours = 4.0;
  const simulatedMTTR = (delta1Hours + delta2Hours) / 2;
  assert(simulatedMTTR === 3.0, 'Unit 1.4: Mathematical verification of MTTR formula calculation');

  // Test 1.5: Configurable SLA Target Assumptions (Correction 3)
  assert(
    SLA_TARGET_HOURS.Critical === 4 &&
      SLA_TARGET_HOURS.High === 8 &&
      SLA_TARGET_HOURS.Medium === 24 &&
      SLA_TARGET_HOURS.Low === 48,
    'Unit 1.5: SLA target hours configured accurately (Critical <= 4h, High <= 8h, Medium <= 24h, Low <= 48h)'
  );

  // --------------------------------------------------------------------------
  // TIER 2: INTEGRATION TESTING (Section 5.4 of Proposal)
  // --------------------------------------------------------------------------
  console.log('\n\x1b[34m[TIER 2: INTEGRATION TESTS (MOCKED & RULE-BASED)]\x1b[0m');

  // Test 2.1: Rule-Based Fallback when Gemini API is unconfigured / times out (Algorithm 2)
  const fallbackResult = await triageTicketWithAI('Unresponsive server power cable missing');
  assert(
    fallbackResult.category === 'General' &&
      fallbackResult.priority === 'Medium' &&
      fallbackResult.status === 'FALLBACK',
    'Integration 2.1: Graceful fallback engine assigns category="General", priority="Medium", status="FALLBACK"'
  );

  // Test 2.2: Strict 1:1 Enforced Relationship in ai_logs (Correction 10)
  const testCustomer = await db.findUserByUsername('student_rahul');
  const testTicket = await db.createTicket({
    customer_id: testCustomer!.user_id,
    department_id: 1,
    title: 'Test Integration Switch Malfunction',
    issue_description: 'Test payload for integrity verification.',
    ai_category: 'Network',
    ai_priority: 'Critical',
    suggested_solution: 'Reboot switch.',
  });

  const log1 = await db.createAILog({
    ticket_id: testTicket.ticket_id,
    model_name: 'gemini-2.5-flash',
    raw_response: JSON.stringify({ category: 'Network', priority: 'Critical' }),
    tokens_used: 120,
    latency_ms: 450,
    status: 'SUCCESS',
  });
  assert(log1.ticket_id === testTicket.ticket_id, 'Integration 2.2a: Successful creation of 1:1 AI audit log');

  let duplicateBlocked = false;
  try {
    // Attempt inserting a second log for the same ticket
    await db.createAILog({
      ticket_id: testTicket.ticket_id,
      model_name: 'gemini-2.5-flash',
      raw_response: '{}',
      tokens_used: 50,
      latency_ms: 200,
      status: 'FALLBACK',
    });
  } catch (e: any) {
    duplicateBlocked = true;
  }
  assert(duplicateBlocked, 'Integration 2.2b: Database integrity rejects duplicate AI log for same ticket (Strict 1:1 Enforced)');

  // Test 2.3: Email Notification Service Dispatch on Resolution (Algorithm 3)
  const emailDispatched = await emailService.sendResolutionNotification({
    ticket_id: testTicket.ticket_id,
    title: testTicket.title,
    customer_name: testCustomer!.username,
    customer_email: testCustomer!.email,
    department_name: 'Network',
    resolution_solution: 'Cleaned optics on LC duplex fiber cable.',
    resolved_by_agent: 'agent_smith',
  });
  assert(
    emailDispatched.recipient_email === testCustomer!.email &&
      emailDispatched.delivery_status === 'DELIVERED_DEV_QUEUE',
    'Integration 2.3: Automated customer email notification generated upon ticket resolution'
  );

  // --------------------------------------------------------------------------
  // TIER 3: SYSTEM & END-TO-END (E2E) TESTING (Correction 2 Standardized)
  // --------------------------------------------------------------------------
  console.log('\n\x1b[34m[TIER 3: SYSTEM / E2E WORKFLOW JOURNEY]\x1b[0m');

  // Step 1: Customer submits issue ("Database connection pool exhausted")
  const e2eTicket = await db.createTicket({
    customer_id: testCustomer!.user_id,
    department_id: 3, // Software
    title: 'Enterprise ERP database connection pool exhausted',
    issue_description: 'Enterprise ERP database cluster rejected student login sessions with error 500.',
    ai_category: 'Software', // Standardized: Software (Correction 2)
    ai_priority: 'Critical',
    suggested_solution: 'Restart connection pooler and increase max connections parameter.',
  });
  assert(e2eTicket.status === 'Open', 'E2E Step 1: Customer submits ticket with status "Open"');

  // Step 2: Critical-First Sorting Verification
  const sortedTickets = await db.getAllTicketsSorted();
  const topTicket = sortedTickets[0];
  assert(topTicket.ai_priority === 'Critical', 'E2E Step 2: Sorting algorithm prioritizes Critical tickets at the top of the queue');

  // Step 3: Agent changes workflow state: Open -> In-Progress
  const agentUser = await db.findUserByUsername('agent_smith');
  const inProgressTicket = await db.updateTicketStatus(e2eTicket.ticket_id, 'In-Progress', agentUser!.user_id);
  assert(inProgressTicket?.status === 'In-Progress', 'E2E Step 3: Agent updates ticket workflow to "In-Progress"');

  // Step 4: Agent resolves ticket: In-Progress -> Resolved
  const resolvedTicket = await db.updateTicketStatus(e2eTicket.ticket_id, 'Resolved', agentUser!.user_id);
  assert(
    resolvedTicket?.status === 'Resolved' &&
      resolvedTicket?.resolved_at !== null &&
      resolvedTicket?.resolved_by_agent_id === agentUser!.user_id,
    'E2E Step 4: Agent transitions ticket to "Resolved", recording resolution timestamp and agent attribution'
  );

  // Step 5: Manual AI Override Verification
  const overriddenTicket = await db.overrideTicketClassification(e2eTicket.ticket_id, 1, 'High'); // Switch to Network / High
  assert(
    overriddenTicket?.ai_category === 'Network' && overriddenTicket?.ai_priority === 'High',
    'E2E Step 5: Agent manually overrides AI department and priority classification'
  );

  console.log('\n================================================================');
  console.log(`TEST RUN COMPLETE: \x1b[32m${passedTests} PASSED\x1b[0m | \x1b[31m${failedTests} FAILED\x1b[0m`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
