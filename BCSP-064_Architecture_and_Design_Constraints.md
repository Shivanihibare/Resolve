# BCSP-064 — Architecture & Design Constraints

## 1. Project Identity

**Official Project Title:**  
AI-Driven IT Service Desk and Automated Ticket Triage System

The implementation must remain aligned with the approved project proposal and must not alter the approved project concept or scope.

---

## 2. Architectural Style

The proposed system is a **secure web-based application** using a traditional **client-server architecture**.

The proposal describes the system as a bridge between:

- Traditional client-server web architecture
- Relational database management
- External cloud-based AI integration

The backend is responsible for application logic and RDBMS interactions, while asynchronous HTTP requests are used for AI processing.

The proposed application structure follows a decoupled **MVC (Model-View-Controller)** approach.

### High-Level Architecture

```text
User / Agent
      |
      v
Web Front End
      |
      v
Back-End Application Logic / API
      |
      +-------------------+
      |                   |
      v                   v
Relational Database    External AI Cloud API
      |                   |
      +---------+---------+
                |
                v
       AI Classification,
       Priority & Suggested
       Resolution
```

---

## 3. Major Operational Modules

The system must remain decoupled into the following **four operational modules**.

### Module 1 — User & Authentication

Responsibilities:

- Customer registration
- User login
- Agent login
- Session management
- Role-Based Access Control (RBAC)

The system must distinguish between:

- `Customer`
- `Agent`

Authentication credentials are validated against the `users` data store.

Role-based access control must prevent a standard customer from accessing agent functionality.

---

### Module 2 — Ticket Ingestion & AI Triage

Responsibilities:

- Accept text-based issue descriptions from users
- Validate the input
- Prepare the AI request payload
- Send the issue to the external AI API
- Parse the returned structured data
- Determine category
- Determine priority
- Generate/use a suggested resolution
- Map the category to the appropriate department
- Store the classified ticket
- Record the AI interaction in `ai_logs`

The current project scope is limited to **text-based ticket submission**.

Voice and live-chat channels are outside the current scope.

---

### Module 3 — Agent Dashboard & Workflow

Responsibilities:

- Retrieve ticket records for support agents
- Display tickets in a prioritized queue
- Place `Critical` tickets before lower-priority tickets
- Allow agents to view complete ticket information
- Allow agents to manually override AI categorization/priority
- Allow agents to update ticket status
- Maintain the workflow:

```text
Open → In-Progress → Resolved
```

Status changes must update the corresponding timestamp.

---

### Module 4 — Reporting & Analytics

Responsibilities:

- Aggregate ticket data
- Produce ticket volume reports
- Show priority distribution
- Show department/category workload
- Show agent performance
- Calculate/report Mean Time to Resolution (MTTR)
- Support SLA-related reporting

The proposal describes visualization using charts such as pie charts, bar graphs, and chronological ticket-volume graphs.

---

## 4. Core Database Entities

The database design must contain the following four core entities:

```text
users
tickets
departments
ai_logs
```

### 4.1 `users`

Represents people who access the system.

Core attributes:

- `user_id` — Primary Key
- `username`
- `role`
- `password_hash`

Role values:

- Customer
- Agent

---

### 4.2 `tickets`

Represents support requests.

Core attributes:

- `ticket_id` — Primary Key
- `customer_id` — Foreign Key
- `department_id` — Foreign Key
- `issue_description`
- `ai_category`
- `ai_priority`
- `status`
- `created_at`
- `updated_at`

Status values specified in the proposal:

- Open
- In-Progress
- Resolved

---

### 4.3 `departments`

Represents the technical routing departments.

Core attributes:

- `department_id` — Primary Key
- `department_name`
- `description`

Example department categories in the proposal include:

- Network
- Hardware
- Account Lockout

---

### 4.4 `ai_logs`

Represents the audit trail for AI interactions.

Core attributes:

- `log_id` — Primary Key
- `ticket_id` — Foreign Key
- `created_at`
- `tokens_used`
- `raw_response`

---

## 5. Database Relationships

The proposal defines the following relationships:

```text
USER       1 : M     TICKET
TICKET     M : 1     DEPARTMENT
TICKET     1 : 1     AI_LOG
```

Meaning:

- One `USER` can submit multiple `TICKETS`.
- Each `TICKET` is assigned to one `DEPARTMENT`.
- Each `TICKET` generates exactly one `AI_LOG`.

The 1:1 ticket-to-AI-log relationship must be preserved in the database design.

---

## 6. Database Integrity & Normalization Constraints

The relational design must follow normalization principles.

### 1NF

- Every table must have a primary key.
- Attributes must contain atomic values.
- No repeating groups.

### 2NF

- Tables must be in 1NF.
- Non-key attributes must be fully functionally dependent on the primary key.

### 3NF

- Tables must be in 2NF.
- No transitive dependencies.
- Department information must be stored separately in the `departments` table rather than duplicated in `tickets`.

---

## 7. Database Indexing Constraints

The proposal specifies indexes for frequently queried operations.

Required indexing intent:

### Dashboard ticket sorting

An index equivalent to:

```text
idx_status_priority
```

on:

```text
tickets(status, ai_priority)
```

to improve dashboard sorting.

### User-role filtering

An index equivalent to:

```text
idx_user_role
```

on:

```text
users(role)
```

to efficiently filter users by role.

---

## 8. Data Flow Diagram Constraints

The project must document data flow through at least:

- Level 0 DFD
- Level 1 DFD
- Level 2 DFD

### Level 0

The context-level system interacts with:

- End User
- AI Cloud API

Core flows include:

- Raw Ticket Data
- Ticket Status
- JSON Text Payload
- Category & Priority

### Level 1

The system must represent the following major processes:

```text
1.0 Authentication
2.0 Ticket Ingestion
3.0 AI Triage Processing
4.0 Dashboard / Workflow
```

### Level 2

Level 2 must expand **Process 3.0 — AI Triage Processing**.

The proposal specifies the following internal stages:

```text
Process 2.0
    |
    v
3.1 Payload Builder
    |
    v
3.2 API
    |
    v
3.3 JSON Parser
    |
    v
DB: Tickets
```

Data transitions include:

- Raw Text
- Formatted JSON
- Raw JSON Response
- Structured Fields

---

## 9. AI Integration Constraints

The AI subsystem must use an **external cloud AI API** rather than a locally trained model.

The proposal permits services such as:

- Google Gemini API
- OpenAI API

AI communication is performed through standard asynchronous HTTP/REST requests.

The backend must:

1. Receive the customer's raw issue text.
2. Construct the JSON request payload.
3. Securely obtain the AI API credential from isolated configuration.
4. Submit the request to the cloud AI API.
5. Parse the returned JSON.
6. Extract category and priority.
7. Map the category to a department.
8. Persist the ticket.
9. Record the AI interaction.

---

## 10. AI Failure Handling Constraint

If the external AI API fails or times out:

- Category must default to `General`.
- Priority must default to `Medium`.
- The ticket must still be stored.
- The administrator/operational side must be alerted to the external API failure.
- The customer must still receive a ticket-created confirmation.

The AI failure path must not prevent ticket creation.

---

## 11. Authentication & Security Constraints

The system must implement:

- User authentication
- Agent authentication
- Session/access-token management
- Role-Based Access Control

The proposal requires secure handling of usernames and passwords during transmission to the server.

The authentication process must:

1. Receive login credentials.
2. Validate the credentials against the `users` table.
3. Determine the user's role.
4. Generate a session/access token.
5. Route the user according to role.

Unauthorized customers must not be allowed to access the agent dashboard.

Passwords must be stored in the database as password hashes rather than plain text.

---

## 12. Ticket Processing Logic

The core processing sequence is:

```text
Customer submits issue
        |
        v
Input validation
        |
        v
Construct AI JSON payload
        |
        v
External AI request
        |
        +----------------------+
        |                      |
      Success                 Failure
        |                      |
        v                      v
Parse category/priority    General + Medium
        |                      |
        +----------+-----------+
                   |
                   v
        Map category to department
                   |
                   v
            Create ticket
                   |
                   v
             Create AI log
                   |
                   v
       Display confirmation
```

---

## 13. Agent Workflow Constraints

The agent-side workflow must support:

- Ticket retrieval
- Ticket prioritization
- Full ticket viewing
- Manual AI correction
- Status updates

The required status sequence is:

```text
Open → In-Progress → Resolved
```

When a ticket reaches `Resolved`:

- The `updated_at` value must be updated.
- The original customer must be notified by email according to the implemented notification mechanism.

---

## 14. Reporting Design Constraints

The reporting module must be based on database data and support:

### Ticket Volume Analysis

Chronological ticket counts per week/month.

### Priority Distribution

Breakdown of tickets by priority, including:

- Critical
- High
- Medium
- Low

### Department Load

Comparison of ticket volume across technical departments.

### Agent Performance & SLA

At minimum, support:

- Total resolved tickets
- Average MTTR
- Resolution timing from `Open` to `Resolved`
- SLA-related performance information

---

## 15. Approved Technology Direction

The proposal identifies the following technology categories:

### Front End

Web technologies such as:

- HTML
- CSS
- JavaScript

### Back End

The proposal lists:

- Java (Servlets/JSP), or
- C# .NET Core

### Database

The proposal lists:

- MySQL Server, or
- Microsoft SQL Server

### AI Integration

- Google Gemini API or OpenAI API
- HTTPS/REST communication

### Version Control

- Git
- GitHub

The IGNOU guidelines also allow flexibility to use current technologies beyond the examples listed in the guideline document.

Any implementation technology chosen must continue to satisfy the approved architecture, functionality, database, security, and software-development requirements.

---

## 16. Testing & Design Verification Constraints

The project must validate the architecture at three levels.

### Unit Testing

Test individual functions/components, including areas such as:

- Authentication-related logic
- Input validation/sanitization
- Database-related functions
- Connection/pooling logic

### Integration Testing

Validate communication across system boundaries, including:

- Backend ↔ AI service
- AI response ↔ ticket database
- Authentication ↔ database

### System / End-to-End Testing

Validate the complete workflow:

```text
Customer submission
→ AI classification
→ Ticket creation
→ Agent queue
→ Correct prioritization
→ Agent processing
→ Resolution
```

---

## 17. Architecture Preservation Rules

Future implementation changes must preserve the following proposal-defined constraints:

- Four-module decomposition.
- Client-server web application structure.
- Relational database design.
- Four core database entities.
- Defined entity relationships.
- AI as an external cloud service.
- Text-based ticket ingestion.
- AI classification and dynamic prioritization.
- Agent manual override.
- Open → In-Progress → Resolved workflow.
- Reporting and analytics.
- AI failure fallback.
- AI interaction logging.
- Role-based security.
- DFD coverage through Level 2.
- ER/database documentation.
- Normalization and database integrity.
- Unit, integration, and system testing.

Changes to implementation technology are acceptable only when the resulting system continues to satisfy the project proposal and its required architecture and functionality.
