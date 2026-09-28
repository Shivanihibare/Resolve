import React, { useState } from 'react';
import { Link } from '../lib/router.tsx';
import {
  Layers,
  Database,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Server,
  Code2,
  ArrowLeft
} from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'dfd' | 'er' | 'normalization' | 'stack' | 'testing'>('architecture');

  const tabs = [
    { id: 'architecture', label: 'System Architecture', icon: Layers },
    { id: 'dfd', label: 'Data Flow Diagrams (DFDs)', icon: Cpu },
    { id: 'er', label: 'Entity-Relationship Model', icon: Database },
    { id: 'normalization', label: 'Data Dictionary & 3NF', icon: CheckCircle2 },
    { id: 'stack', label: 'Technology Stack', icon: Server },
    { id: 'testing', label: 'Validation & Testing', icon: Code2 },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner with Official Academic Identity */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800 text-indigo-300 text-xs font-semibold mb-2 border border-slate-700">
              <span>BCSP-064 Major Project &bull; Academic Documentation</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              AI-Driven IT Service Desk and Automated Ticket Triage System
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Decoupled MVC Web Architecture &bull; Relational Database Management &bull; Cloud AI Structured Triage
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition shrink-0 self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Application</span>
          </Link>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          This documentation area contains the complete architectural, data design, and compliance artifacts defined in the project specification. While the client-facing application is presented under the SaaS product identity <strong>ResolveIT</strong>, the underlying database schema, API contracts, RBAC model, and multi-tier DFDs strictly preserve the formal academic implementation.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === t.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: System Architecture */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Decoupled Client-Server MVC Architecture</h2>
              <p className="text-xs text-slate-500 mt-1">
                Bridge between traditional client-server web architecture, relational database management, and asynchronous external cloud AI processing.
              </p>
            </div>

            <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl font-mono text-xs overflow-x-auto">
              <pre className="text-emerald-400 leading-relaxed">{`
  +-------------------------------------------------------------------------+
  |                       Presentation Layer (React SPA)                    |
  |  - Public Portal (Landing, Docs)                                       |
  |  - Customer Portal (/customer, /customer/tickets, /customer/tickets/new)|
  |  - Agent Operations Console (/agent, /agent/tickets, /agent/analytics)   |
  +-------------------------------------------------------------------------+
                                      |
                      JSON REST API over HTTPS (/api/v1)
                                      v
  +-------------------------------------------------------------------------+
  |                    Application Layer (Node.js Express)                  |
  |  Module 1: User & Authentication (JWT Token & Strict RBAC Enforcement) |
  |  Module 2: Ticket Ingestion & AI Triage Pipeline (Algorithm 2)          |
  |  Module 3: Agent Priority Queue & Manual Override Console               |
  |  Module 4: Analytics Aggregation & MTTR Metric Engine                   |
  +-------------------------------------------------------------------------+
                     /                                     \\
        Asynchronous REST Payload                   Prepared SQL Transactions
                   v                                         v
  +--------------------------------+       +--------------------------------+
  | External Cloud AI (Gemini API) |       | Relational Database (MySQL)    |
  | - Structured JSON Classification|       | - users, tickets, departments  |
  | - Urgency Scoring & Diagnostics|       | - ai_logs (Strict 1:1 audit)   |
  | - Resilient Algorithm 2 Fallback|      | - Indexes: status, ai_priority |
  +--------------------------------+       +--------------------------------+
              `}</pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <span className="font-bold text-slate-900 block">Module 1: User &amp; Authentication</span>
                <p className="text-slate-600 leading-relaxed">
                  Bcrypt hashed password storage, JWT token issuance with 7-day expiration, and server-enforced role separation (Customer vs. Agent). Agent registration is strictly prevented on public routes.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <span className="font-bold text-slate-900 block">Module 2: Ticket Ingestion &amp; Triage</span>
                <p className="text-slate-600 leading-relaxed">
                  Sanitizes input, formats structured JSON prompt, invokes cloud LLM, parses response into standard categories and priorities, maps to department, and logs 1:1 audit record.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <span className="font-bold text-slate-900 block">Module 3: Agent Workflow Console</span>
                <p className="text-slate-600 leading-relaxed">
                  Critical-first dynamic queue ordering, manual classification overrides (human-in-the-loop), and lifecycle status sequence (Open &rarr; In-Progress &rarr; Resolved) with automated customer email dispatch.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <span className="font-bold text-slate-900 block">Module 4: Analytics &amp; Reporting</span>
                <p className="text-slate-600 leading-relaxed">
                  Calculates Mean Time to Resolution (MTTR) as &Sigma;(resolved_at - created_at) / N, priority breakdown, department workload, and specialist SLA adherence rates against targets.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: DFDs */}
      {activeTab === 'dfd' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">Level-0 Context Diagram</h3>
              <p className="text-xs text-slate-500">
                Illustrates the global system boundary between external entities and the automated triage system.
              </p>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-6 text-center text-xs font-mono">
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs w-44">
                  <span className="font-bold text-slate-900 block">[End User / Customer]</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Submits Raw Issue &bull; Receives Status</span>
                </div>

                <div className="flex flex-col items-center text-[10px] text-slate-500">
                  <span>Raw Text Description &rarr;</span>
                  <div className="w-20 h-px bg-slate-300 my-1" />
                  <span>&larr; Ticket Status &amp; Solution</span>
                </div>

                <div className="w-36 h-36 rounded-full bg-blue-600 text-white flex flex-col items-center justify-center shadow-md p-2">
                  <span className="font-bold text-sm">0.0</span>
                  <span className="text-[11px] font-semibold text-blue-100 text-center leading-tight mt-1">
                    AI Service Desk System
                  </span>
                </div>

                <div className="flex flex-col items-center text-[10px] text-slate-500">
                  <span>&rarr; Issue Payload</span>
                  <div className="w-20 h-px bg-slate-300 my-1" />
                  <span>&larr; Structured JSON</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs w-44">
                  <span className="font-bold text-indigo-700 block">[Cloud AI API]</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Category &bull; Priority &bull; Diagnostics</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Level-1 Data Flow Diagram (Operational Modules)</h3>
              <p className="text-xs text-slate-500">
                Decomposition into the 4 core processing stages and data stores.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-blue-700 block">Process 1.0: Authentication &amp; Access Control</span>
                  <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                    Validates user/agent credentials against `users` table; generates signed JWT session token.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-blue-700 block">Process 2.0: Ticket Ingestion</span>
                  <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                    Sanitizes customer text description and prepares payload for classification pipeline.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-blue-700 block">Process 3.0: AI Triage &amp; Resilience Fallback</span>
                  <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                    Dispatches asynchronous request to Gemini API; stores result in `tickets` and `ai_logs`.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-blue-700 block">Process 4.0: Priority Queue &amp; Analytics</span>
                  <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                    Sorts incidents Critical-first, manages status lifecycle, and computes MTTR analytics.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Level-2 DFD: Process 3.0 (AI Triage Processing)</h3>
              <p className="text-xs text-slate-500">
                Internal stages of payload generation, structured API query, and fallback handling.
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-center w-full md:w-auto">
                  <span className="text-[10px] text-slate-400 block">Source</span>
                  <span className="font-bold text-slate-800">2.0 Raw Text</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center w-full md:w-auto">
                  <span className="text-[10px] text-blue-600 block">3.1 Builder</span>
                  <span className="font-bold text-blue-900">JSON Payload</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center w-full md:w-auto">
                  <span className="text-[10px] text-indigo-600 block">3.2 Cloud API</span>
                  <span className="font-bold text-indigo-900">Gemini Request</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center w-full md:w-auto">
                  <span className="text-[10px] text-emerald-600 block">3.3 Parser</span>
                  <span className="font-bold text-emerald-900">Category &amp; Priority</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />
                <div className="p-3 bg-slate-900 text-white rounded-xl text-center w-full md:w-auto">
                  <span className="text-[10px] text-slate-400 block">Storage</span>
                  <span className="font-bold text-white">tickets &amp; ai_logs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: ER Model */}
      {activeTab === 'er' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Entity-Relationship Structural Model</h2>
              <p className="text-xs text-slate-500 mt-1">
                4 core relational entities with strict cardinalities and referential integrity constraints.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-blue-700 block">Entity: users</span>
                <ul className="space-y-1 text-slate-600 text-[11px]">
                  <li><strong className="text-slate-800">user_id:</strong> INT PK AUTO_INCREMENT</li>
                  <li><strong className="text-slate-800">username:</strong> VARCHAR(50) UNIQUE NOT NULL</li>
                  <li><strong className="text-slate-800">email:</strong> VARCHAR(100) UNIQUE NOT NULL</li>
                  <li><strong className="text-slate-800">password_hash:</strong> VARCHAR(255) NOT NULL</li>
                  <li><strong className="text-slate-800">role:</strong> ENUM('Customer', 'Agent')</li>
                  <li><strong className="text-slate-800">created_at:</strong> TIMESTAMP</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-emerald-700 block">Entity: departments</span>
                <ul className="space-y-1 text-slate-600 text-[11px]">
                  <li><strong className="text-slate-800">department_id:</strong> INT PK AUTO_INCREMENT</li>
                  <li><strong className="text-slate-800">department_name:</strong> VARCHAR(50) UNIQUE NOT NULL</li>
                  <li><strong className="text-slate-800">description:</strong> TEXT NOT NULL</li>
                  <li><strong className="text-slate-800">created_at:</strong> TIMESTAMP</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-indigo-700 block">Entity: tickets</span>
                <ul className="space-y-1 text-slate-600 text-[11px]">
                  <li><strong className="text-slate-800">ticket_id:</strong> INT PK AUTO_INCREMENT</li>
                  <li><strong className="text-slate-800">customer_id:</strong> INT FK &rarr; users(user_id)</li>
                  <li><strong className="text-slate-800">department_id:</strong> INT FK &rarr; departments(department_id)</li>
                  <li><strong className="text-slate-800">resolved_by_agent_id:</strong> INT FK &rarr; users(user_id)</li>
                  <li><strong className="text-slate-800">ai_priority:</strong> ENUM('Low', 'Medium', 'High', 'Critical')</li>
                  <li><strong className="text-slate-800">status:</strong> ENUM('Open', 'In-Progress', 'Resolved')</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-purple-700 block">Entity: ai_logs</span>
                <ul className="space-y-1 text-slate-600 text-[11px]">
                  <li><strong className="text-slate-800">log_id:</strong> INT PK AUTO_INCREMENT</li>
                  <li><strong className="text-slate-800">ticket_id:</strong> INT FK UNIQUE (Strict 1:1 Constraint)</li>
                  <li><strong className="text-slate-800">model_name:</strong> VARCHAR(50) NOT NULL</li>
                  <li><strong className="text-slate-800">tokens_used:</strong> INT NOT NULL</li>
                  <li><strong className="text-slate-800">latency_ms:</strong> INT NOT NULL</li>
                  <li><strong className="text-slate-800">status:</strong> ENUM('SUCCESS', 'FALLBACK')</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
              <span className="font-bold block mb-1">Defined Database Cardinalities:</span>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>USER 1 : M TICKET</strong> &mdash; One customer submits zero or many tickets.</li>
                <li><strong>DEPARTMENT 1 : M TICKET</strong> &mdash; One department routes zero or many tickets.</li>
                <li><strong>TICKET 1 : 1 AI_LOG</strong> &mdash; Each ticket generates exactly one AI triage log entry (enforced via unique key).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Normalization */}
      {activeTab === 'normalization' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Database Normalization Proof (1NF &rarr; 2NF &rarr; 3NF)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Formal proof establishing third normal form compliance across all database entities.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">1. First Normal Form (1NF) Compliance</span>
                <p className="text-slate-600 leading-relaxed">
                  Every attribute contains exclusively atomic, indivisible values. Tables have designated primary keys (<code className="font-mono text-slate-800">user_id</code>, <code className="font-mono text-slate-800">ticket_id</code>, <code className="font-mono text-slate-800">department_id</code>, <code className="font-mono text-slate-800">log_id</code>) and contain no repeating groups or multi-valued attributes.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">2. Second Normal Form (2NF) Compliance</span>
                <p className="text-slate-600 leading-relaxed">
                  All relations satisfy 1NF. Every table uses a single-column primary key rather than a composite key; therefore, all non-prime attributes are fully functionally dependent on the complete primary key with zero partial dependencies.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">3. Third Normal Form (3NF) Compliance</span>
                <p className="text-slate-600 leading-relaxed">
                  All relations satisfy 2NF with zero transitive functional dependencies ($X \to Y \to Z$). Technical routing units are factored into an independent <code className="font-mono text-slate-800">departments</code> entity; ticket records reference only <code className="font-mono text-slate-800">department_id</code>, eliminating redundant department name and description duplication across incident rows.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Technology Stack */}
      {activeTab === 'stack' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Approved Technology Stack</h2>
              <p className="text-xs text-slate-500 mt-1">
                Full-stack web architecture leveraging TypeScript, modern React, Express, and cloud AI SDKs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-900 block">Frontend Framework</span>
                <p className="text-slate-600">React 19 &bull; Vite 8 &bull; TypeScript 5 &bull; Tailwind CSS v4</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-900 block">Backend Server</span>
                <p className="text-slate-600">Node.js &bull; Express 4 &bull; TypeScript Execution via TSX</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-900 block">Database Storage</span>
                <p className="text-slate-600">MySQL Server 8 (with dual In-Memory mock for zero-dependency execution)</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-900 block">AI Integration</span>
                <p className="text-slate-600">Google Gemini API (@google/genai SDK) with structured JSON schemas</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-900 block">Security &amp; Auth</span>
                <p className="text-slate-600">JSON Web Tokens (JWT) &bull; Bcrypt Password Hashing &bull; Strict RBAC</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-bold text-slate-900 block">Visualization</span>
                <p className="text-slate-600">Recharts (Responsive Pie, Bar, and Line Chronological Graphs)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Validation & Testing */}
      {activeTab === 'testing' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Verification &amp; Test Suite Coverage</h2>
              <p className="text-xs text-slate-500 mt-1">
                Unit, integration, and end-to-end regression test plans validating Section 16 requirements.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <span className="font-bold text-slate-900 block">Automated Regression Test Suite (`tests/run_tests.ts`)</span>
                <p className="text-slate-600 leading-relaxed">
                  Executes automated checks verifying user registration, duplicate credential prevention, JWT generation, AI triage parsing, Algorithm 2 resilient fallback execution, Critical-first priority queue sorting, status lifecycle progression, and MTTR mathematical aggregation.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <span className="font-bold text-slate-900 block">Smoke Test Suite (`tests/smoke_test_gemini.ts`)</span>
                <p className="text-slate-600 leading-relaxed">
                  Validates live cloud communication against Google Gemini endpoint when credentials are provided, or confirms non-blocking fallback categorization when offline.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
