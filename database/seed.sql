-- ============================================================================
-- IGNOU BCA 6th Semester (BCSP-064) Seed Data Script
-- Project Title: AI-Driven IT Service Desk and Automated Ticket Triage System
-- Default Seed Credentials:
--   Customer: student@university.ac.in (Password: customer123)
--   Agent 1:  agent_smith (Password: agent123)
--   Agent 2:  agent_kumar (Password: agent123)
-- ============================================================================

USE service_desk_db;

-- Standardized Departments (Requirement 1)
INSERT INTO departments (department_id, department_name, description) VALUES
(1, 'Network', 'Routers, switches, VPN, IP addressing, DNS, and physical connectivity'),
(2, 'Hardware', 'Laptops, desktops, monitors, docking stations, and peripherals'),
(3, 'Software', 'Operating systems, productivity suites, specialized ERP/CRM tools'),
(4, 'Security', 'Malware alerts, phishing reports, certificates, and access control'),
(5, 'Account Access', 'SSO credentials, multi-factor authentication, account lockouts, password resets'),
(6, 'General', 'Uncategorized requests, IT equipment inquiries, and general assistance')
ON DUPLICATE KEY UPDATE department_name=VALUES(department_name);

-- Default Demo Users
-- Note: bcrypt hashes generated with 10 salt rounds
-- 'customer123' -> $2b$10$E5z7bQ...
-- 'agent123' -> $2b$10$O0KqG...
INSERT INTO users (user_id, username, email, password_hash, role) VALUES
(1, 'student_rahul', 'rahul@ignou.ac.in', '$2a$10$j8N5Kx4Pj.Vw1o7Wd8Jre.VbC56D7v1Kq7u7CqV1cZ2nJ2vYgPkeO', 'Customer'),
(2, 'faculty_anita', 'anita@ignou.ac.in', '$2a$10$j8N5Kx4Pj.Vw1o7Wd8Jre.VbC56D7v1Kq7u7CqV1cZ2nJ2vYgPkeO', 'Customer'),
(3, 'agent_smith', 'smith@servicedesk.org', '$2a$10$Z3m4G9GkVfN8hYQpX0fReOnbL67F8u9Tq5t7WqV1cZ2nJ2vYgPkeO', 'Agent'),
(4, 'agent_kumar', 'kumar@servicedesk.org', '$2a$10$Z3m4G9GkVfN8hYQpX0fReOnbL67F8u9Tq5t7WqV1cZ2nJ2vYgPkeO', 'Agent')
ON DUPLICATE KEY UPDATE username=VALUES(username);

-- Realistic Historical Tickets (Supporting MTTR & SLA Analytics)
INSERT INTO tickets (ticket_id, customer_id, department_id, resolved_by_agent_id, title, issue_description, ai_category, ai_priority, status, suggested_solution, created_at, updated_at, resolved_at) VALUES
(1, 1, 1, 3, 'Core switch offline in Lab 4', 'Entire computer science laboratory 4 lost connection to the internal subnet and gateway.', 'Network', 'Critical', 'Resolved', 'Power cycled edge switch and replaced faulty SFP+ fiber transceiver module.', DATE_SUB(NOW(), INTERVAL 48 HOUR), DATE_SUB(NOW(), INTERVAL 46 HOUR), DATE_SUB(NOW(), INTERVAL 46 HOUR)),
(2, 2, 4, 3, 'Suspicious phishing email targeting faculty', 'Received email claiming urgent payroll update with link to external non-university domain.', 'Security', 'High', 'Resolved', 'Quarantined sender domain at mail gateway and flushed malicious rule.', DATE_SUB(NOW(), INTERVAL 36 HOUR), DATE_SUB(NOW(), INTERVAL 31 HOUR), DATE_SUB(NOW(), INTERVAL 31 HOUR)),
(3, 1, 5, 4, 'Account locked out after password expiration', 'Unable to login to portal for BCA assignment submission.', 'Account Access', 'Medium', 'Resolved', 'Verified student enrollment ID and triggered self-service unlock link.', DATE_SUB(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 21 HOUR), DATE_SUB(NOW(), INTERVAL 21 HOUR)),
(4, 2, 3, 4, 'Compiler error in Turbo C++ / VS Code lab environment', 'Students experiencing segmentation faults in C compilation lab due to path errors.', 'Software', 'Medium', 'In-Progress', 'Reinstall GCC MinGW toolchain and reconfigure Windows PATH environment variable.', DATE_SUB(NOW(), INTERVAL 10 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), NULL),
(5, 1, 1, NULL, 'Wi-Fi gateway intermittent in student cafeteria', 'Signals drop every 5 minutes when accessing study resources.', 'Network', 'Low', 'Open', 'Inspect wireless access point channel interference and update firmware.', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), NULL),
(6, 2, 1, NULL, 'Enterprise ERP database connection pool exhausted', 'Campus intranet reporting 500 error connecting to central student records database.', 'Network', 'Critical', 'Open', 'Investigate max_connections on database cluster and purge idle hanging threads.', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), NULL);

-- Corresponding 1:1 AI Audit Logs
INSERT INTO ai_logs (log_id, ticket_id, model_name, raw_response, tokens_used, latency_ms, status, created_at) VALUES
(1, 1, 'gemini-2.5-flash', '{"category": "Network", "priority": "Critical", "suggested_solution": "Power cycle edge switch and verify link carrier status.", "confidence_score": 0.98, "reasoning": "High impact outage affecting entire student lab subnet"}', 184, 820, 'SUCCESS', DATE_SUB(NOW(), INTERVAL 48 HOUR)),
(2, 2, 'gemini-2.5-flash', '{"category": "Security", "priority": "High", "suggested_solution": "Block sender domain and alert faculty members.", "confidence_score": 0.95, "reasoning": "Targeted credential harvesting threat detected."}', 162, 740, 'SUCCESS', DATE_SUB(NOW(), INTERVAL 36 HOUR)),
(3, 3, 'gemini-2.5-flash', '{"category": "Account Access", "priority": "Medium", "suggested_solution": "Reset account lock flag in identity directory.", "confidence_score": 0.99, "reasoning": "Standard user authentication lockout."}', 140, 610, 'SUCCESS', DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(4, 4, 'gemini-2.5-flash', '{"category": "Software", "priority": "Medium", "suggested_solution": "Reconfigure PATH variable and reinstall compiler.", "confidence_score": 0.91, "reasoning": "IDE and developer tool configuration error."}', 178, 890, 'SUCCESS', DATE_SUB(NOW(), INTERVAL 10 HOUR)),
(5, 5, 'gemini-2.5-flash', '{"category": "Network", "priority": "Low", "suggested_solution": "Check AP beacon and channel congestion.", "confidence_score": 0.88, "reasoning": "Non-critical wireless interference in recreational zone."}', 155, 680, 'SUCCESS', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(6, 6, 'gemini-2.5-flash', '{"category": "Network", "priority": "Critical", "suggested_solution": "Inspect socket connections, database connection pool, and firewall rules.", "confidence_score": 0.97, "reasoning": "Mission critical infrastructure database failure."}', 210, 940, 'SUCCESS', DATE_SUB(NOW(), INTERVAL 1 HOUR));
