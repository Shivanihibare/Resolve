/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * IGNOU BCA Major Project BCSP-064
 * Project Title: AI-Driven IT Service Desk and Automated Ticket Triage System
 * Server-Side Gemini AI Triage Engine
 * 
 * Uses @google/genai SDK strictly on the server-side with structured JSON output.
 * Ensures zero client-side exposure of API keys.
 * Implements resilient rule-based fallback mechanism as specified in Algorithm 2.
 */

import { GoogleGenAI, Type } from '@google/genai';

// Standardized Departments from approved specification
export const STANDARDIZED_DEPARTMENTS = [
  'Network',
  'Hardware',
  'Software',
  'Security',
  'Account Access',
  'General',
] as const;

export type StandardDepartment = (typeof STANDARDIZED_DEPARTMENTS)[number];

// Standardized Urgency Priorities
export const STANDARDIZED_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
export type StandardPriority = (typeof STANDARDIZED_PRIORITIES)[number];

export interface TriageResult {
  category: StandardDepartment;
  priority: StandardPriority;
  suggested_solution: string;
  confidence_score: number;
  reasoning: string;
  model_name: string;
  tokens_used: number;
  latency_ms: number;
  status: 'SUCCESS' | 'FALLBACK';
  raw_response: string;
}

/**
 * Executes AI triage on raw customer issue description.
 * Adheres strictly to Algorithm 2 of project proposal:
 * - On success: returns structured category, priority, and suggested resolution.
 * - On failure/timeout: returns Category="General", Priority="Medium", status="FALLBACK".
 */
export async function triageTicketWithAI(issueDescription: string): Promise<TriageResult> {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback template as specified in Requirement 4 & Algorithm 2
  const fallbackResult: TriageResult = {
    category: 'General',
    priority: 'Medium',
    suggested_solution: 'Initial automated triage unavailable. Assigned to General Support queue for manual review.',
    confidence_score: 0.5,
    reasoning: 'System executed automated fallback due to external AI API unavailability or timeout.',
    model_name: 'gemini-2.5-flash',
    tokens_used: 0,
    latency_ms: 0,
    status: 'FALLBACK',
    raw_response: JSON.stringify({
      error: 'AI API unavailable or unconfigured. Applied standard General/Medium fallback as per Algorithm 2.',
    }),
  };

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.warn('[AI Triage] GEMINI_API_KEY not configured. Executing graceful General/Medium fallback.');
    fallbackResult.latency_ms = Date.now() - startTime;
    return fallbackResult;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are the lead Automated Triage and Classification Engine for an enterprise IT Service Desk system (IGNOU BCA BCSP-064 Project).
Your task is to analyze the user's raw technical issue description and provide structured JSON triage data.

RULES:
1. "category" MUST be strictly one of:
   - "Network" (Wi-Fi, routers, switches, VPN, IP addressing, DNS, physical cables)
   - "Hardware" (monitors, laptops, mice, keyboards, docking stations, physical damage)
   - "Software" (operating systems, IDEs, office suites, database software, ERP/CRM apps)
   - "Security" (phishing, malware, suspicious files, unauthorized access attempts)
   - "Account Access" (passwords, MFA tokens, login lockouts, SSO problems)
   - "General" (inquiries or issues not fitting other domains)

2. "priority" MUST be strictly one of:
   - "Critical" (outages stopping entire operations, database failures, major security breaches)
   - "High" (severely degraded performance for multiple users, time-sensitive roadblocks)
   - "Medium" (single user impacted with workarounds available)
   - "Low" (minor glitches, cosmetic UI flaws, generic non-urgent inquiries)

3. "suggested_solution": Provide actionable, concise, technical troubleshooting steps or boilerplate resolution for the IT support agent.
4. "confidence_score": Decimal between 0.0 and 1.0.
5. "reasoning": 1-2 sentence justification for the chosen department and priority.`;

    let modelName = 'gemini-2.5-flash';
    let response;
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents: `Raw Issue Description:\n"""\n${issueDescription}\n"""`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                enum: [...STANDARDIZED_DEPARTMENTS],
                description: 'Target IT department classification',
              },
              priority: {
                type: Type.STRING,
                enum: [...STANDARDIZED_PRIORITIES],
                description: 'Urgency priority level',
              },
              suggested_solution: {
                type: Type.STRING,
                description: 'Suggested troubleshooting steps or boilerplate agent response',
              },
              confidence_score: {
                type: Type.NUMBER,
                description: 'Confidence between 0.0 and 1.0',
              },
              reasoning: {
                type: Type.STRING,
                description: 'Brief justification for priority and department',
              },
            },
            required: ['category', 'priority', 'suggested_solution'],
          },
        },
      });
    } catch (modelErr: any) {
      // Fallback model trial if specific version alias is updated
      modelName = 'gemini-1.5-flash';
      response = await ai.models.generateContent({
        model: modelName,
        contents: `Raw Issue Description:\n"""\n${issueDescription}\n"""`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                enum: [...STANDARDIZED_DEPARTMENTS],
                description: 'Target IT department classification',
              },
              priority: {
                type: Type.STRING,
                enum: [...STANDARDIZED_PRIORITIES],
                description: 'Urgency priority level',
              },
              suggested_solution: {
                type: Type.STRING,
                description: 'Suggested troubleshooting steps or boilerplate agent response',
              },
              confidence_score: {
                type: Type.NUMBER,
                description: 'Confidence between 0.0 and 1.0',
              },
              reasoning: {
                type: Type.STRING,
                description: 'Brief justification for priority and department',
              },
            },
            required: ['category', 'priority', 'suggested_solution'],
          },
        },
      });
    }

    const latencyMs = Date.now() - startTime;
    const rawText = response.text || '{}';
    const parsed = JSON.parse(rawText);

    // Validate fields strictly
    const category = STANDARDIZED_DEPARTMENTS.includes(parsed.category) ? parsed.category : 'General';
    const priority = STANDARDIZED_PRIORITIES.includes(parsed.priority) ? parsed.priority : 'Medium';
    const suggested_solution = parsed.suggested_solution || 'Perform standard initial diagnostic triage.';
    const confidence_score = typeof parsed.confidence_score === 'number' ? parsed.confidence_score : 0.9;
    const reasoning = parsed.reasoning || 'Automated triage based on issue context.';

    // Estimate or extract tokens
    const tokensUsed = response.usageMetadata?.totalTokenCount || Math.ceil((issueDescription.length + rawText.length) / 4);

    return {
      category,
      priority,
      suggested_solution,
      confidence_score,
      reasoning,
      model_name: 'gemini-2.5-flash',
      tokens_used: tokensUsed,
      latency_ms: latencyMs,
      status: 'SUCCESS',
      raw_response: rawText,
    };
  } catch (error: any) {
    console.error('[AI Triage Exception] External API call failed:', error?.message || error);
    fallbackResult.latency_ms = Date.now() - startTime;
    fallbackResult.raw_response = JSON.stringify({
      error: error?.message || 'External Gemini API exception caught',
      timestamp: new Date().toISOString(),
      fallback_applied: true,
    });
    return fallbackResult;
  }
}
