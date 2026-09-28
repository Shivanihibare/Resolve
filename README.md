# AI-Driven IT Service Desk and Automated Ticket Triage System

**Academic Programme:** Bachelor of Computer Applications (BCA) — IGNOU  
**Course Code:** BCSP-064 (8 Credits)  
**Project Category:** Artificial Intelligence / Relational Database Management Systems (RDBMS) / Internet Technologies  

---

## 1. Project Overview & Problem Statement
In modern enterprise environments, technical support desks frequently become overwhelmed by unorganized, unstructured user tickets. The manual sorting (triage) of these tickets introduces significant operational delays, directly impacting the Mean Time to Resolution (MTTR) and leading to Service Level Agreement (SLA) breaches. End-users often submit ambiguous issue descriptions, requiring support agents to spend valuable time deciphering the problem, categorizing it, and determining its urgency.

This project delivers a secure, automated web application designed to handle the classification and prioritization of incoming support requests. By integrating the Google Gemini API with a classic Three-Tier client-server relational architecture, the system automatically analyzes ticket sentiment, domain context, and urgency in real-time.

---

## 2. Standardized Domain Specifications

### 2.1 Standardized Routing Departments
1. **Network:** Routers, switches, Wi-Fi, VPN, IP addressing, DNS, and physical connectivity.
2. **Hardware:** Laptops, desktops, monitors, docking stations, power adapters, and peripherals.
3. **Software:** Operating systems, developer IDEs, office suites, database software, ERP/CRM apps.
4. **Security:** Phishing attacks, malware alerts, certificate expirations, access control breaches.
5. **Account Access:** Single Sign-On (SSO) credentials, MFA tokens, login lockouts, password resets.
6. **General:** Inquiries or issues not fitting other specific domains.

### 2.2 Standardized Urgency Priorities
- **Critical:** Complete operational outages, database cluster downtime, active security breaches.
- **High:** Severely impaired operations for multiple users with no immediate workaround.
- **Medium:** Single user impacted with an acceptable temporary workaround.
- **Low:** Cosmetic issues, minor inconveniences, or general informational inquiries.

### 2.3 Resilient Algorithm 2 AI Fallback Behavior
If the external Gemini API is unreachable, times out, or quota-limited:
- The ticket is **successfully created** without blocking the user.
- **Category** is assigned to `General`.
- **Priority** is assigned to `Medium`.
- An audit record is created in `ai_logs` with `status = 'FALLBACK'`.
- The fallback condition is surfaced in the Agent AI Audit dashboard with server-side diagnostic details.

### 2.4 Configurable SLA Target Assumptions (Project-Defined)
- **Critical:** $\le 4$ Hours
- **High:** $\le 8$ Hours
- **Medium:** $\le 24$ Hours
- **Low:** $\le 48$ Hours

---

## 3. Database Design & 3NF Normalization (MySQL)

The schema implements exactly the **four core entities** defined in the approved synopsis:

1. **`users` Table:**
   - `user_id` (INT PK, Auto-Increment)
   - `username` (VARCHAR(50) UNIQUE NOT NULL)
   - `email` (VARCHAR(100) UNIQUE NOT NULL)
   - `password_hash` (VARCHAR(255) NOT NULL, Bcrypt)
   - `role` (ENUM('Customer', 'Agent') NOT NULL DEFAULT 'Customer')
   - *Security Rule:* Public registration is strictly locked to `'Customer'`. Agent accounts are provisioned via administrative seed scripts.

2. **`departments` Table:**
   - `department_id` (INT PK, Auto-Increment)
   - `department_name` (VARCHAR(50) UNIQUE NOT NULL)
   - `description` (TEXT NOT NULL)

3. **`tickets` Table:**
   - `ticket_id` (INT PK, Auto-Increment)
   - `customer_id` (INT FK $\rightarrow$ `users.user_id`)
   - `department_id` (INT FK $\rightarrow$ `departments.department_id`)
   - `resolved_by_agent_id` (INT NULL FK $\rightarrow$ `users.user_id`)
   - `title` (VARCHAR(150) NOT NULL)
   - `issue_description` (TEXT NOT NULL)
   - `ai_category` (VARCHAR(50) NOT NULL)
   - `ai_priority` (ENUM('Low', 'Medium', 'High', 'Critical'))
   - `status` (ENUM('Open', 'In-Progress', 'Resolved'))
   - `suggested_solution` (TEXT NULL)
   - `created_at`, `updated_at`, `resolved_at` (Timestamps)
   - *Index:* `idx_status_priority (status, ai_priority)` for Critical-First sorting.

4. **`ai_logs` Table (Strict 1:1 Enforced via UNIQUE Foreign Key):**
   - `log_id` (INT PK, Auto-Increment)
   - `ticket_id` (INT UNIQUE FK $\rightarrow$ `tickets.ticket_id`)
   - `model_name` (VARCHAR(50) NOT NULL)
   - `raw_response` (TEXT NOT NULL)
   - `tokens_used` (INT NOT NULL)
   - `latency_ms` (INT NOT NULL)
   - `status` (ENUM('SUCCESS', 'FALLBACK'))

---

## 4. Default Seed Credentials

| Role | Username | Email | Password |
|---|---|---|---|
| **Customer** | `student_rahul` | `rahul@ignou.ac.in` | `student123` |
| **Customer** | `faculty_anita` | `anita@ignou.ac.in` | `student123` |
| **Agent 1** | `agent_smith` | `smith@servicedesk.org` | `agent123` |
| **Agent 2** | `agent_kumar` | `kumar@servicedesk.org` | `agent123` |
| **Agent 3** | `agent_patel` | `patel@servicedesk.org` | `agent123` |

---

## 5. Automated Three-Tier Testing

Run the automated test suite with:
```bash
npx tsx tests/run_tests.ts
```

### Test Coverage Summary:
- **Tier 1 (Unit Testing):**
  - Bcrypt password hashing & salt verification.
  - Standardized 6 department constants integrity check.
  - Urgency priority tier validation (Low, Medium, High, Critical).
  - Mathematical MTTR calculation formula verification.
  - Configurable SLA target hours configuration verification.
- **Tier 2 (Integration Testing):**
  - Algorithm 2 rule-based fallback engine verification (General/Medium/FALLBACK).
  - Database referential integrity & strict 1:1 AI log constraint verification.
  - Customer email notification dispatch verification on ticket resolution.
- **Tier 3 (System / E2E Testing):**
  - Customer submits critical software/database ticket.
  - Critical-first priority sorting algorithm verification.
  - Support agent status workflow transition (Open $\rightarrow$ In-Progress $\rightarrow$ Resolved).
  - Resolution timestamp and agent attribution recording (`total_resolved_tickets`).
  - Manual AI classification override verification.

---

## 6. How to Run the Application

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server (Port 3000):**
   ```bash
   npm run dev
   ```

3. **Run Automated Tests:**
   ```bash
   npx tsx tests/run_tests.ts
   ```

4. **Run Live Gemini API Smoke Test:**
   ```bash
   npx tsx tests/smoke_test_gemini.ts
   ```
