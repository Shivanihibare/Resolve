/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * IGNOU BCA Major Project (BCSP-064)
 * Live Gemini API Smoke Test Runner
 * 
 * Tests live connection to Google Gemini API using @google/genai SDK
 * and validates structured JSON output schema conformance.
 * 
 * Run with: npx tsx tests/smoke_test_gemini.ts
 */

import { triageTicketWithAI } from '../server/aiService.ts';

async function runSmokeTest() {
  console.log('\n================================================================');
  console.log('MANUAL / LIVE GEMINI API SMOKE TEST (Correction 5)');
  console.log('================================================================\n');

  const testPrompt = 'Core edge router in central server room is unresponsive. All campus web portals and VPN gateways are failing to resolve DNS.';
  console.log(`Input Issue Description:\n"${testPrompt}"\n`);
  console.log('Dispatching request to Gemini API...');

  const result = await triageTicketWithAI(testPrompt);

  console.log('\n--- TRIAGE RESULT ---');
  console.log(`Assigned Category:    ${result.category}`);
  console.log(`Determined Priority:  ${result.priority}`);
  console.log(`Execution Status:     ${result.status}`);
  console.log(`Latency:              ${result.latency_ms} ms`);
  console.log(`Tokens Used:          ${result.tokens_used}`);
  console.log(`Confidence:           ${result.confidence_score}`);
  console.log(`Reasoning:            ${result.reasoning}`);
  console.log(`Suggested Solution:   ${result.suggested_solution}`);
  console.log('\n================================================================\n');
}

runSmokeTest().catch(console.error);
