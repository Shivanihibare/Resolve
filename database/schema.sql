-- ============================================================================
-- IGNOU BCA 6th Semester (BCSP-064) Major Project
-- Project Title: AI-Driven IT Service Desk and Automated Ticket Triage System
-- Database Design & DDL Specification (Strict 3NF Compliance)
-- Relational Database: MySQL 8.0+
-- ============================================================================

DROP DATABASE IF EXISTS service_desk_db;
CREATE DATABASE service_desk_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE service_desk_db;

-- ----------------------------------------------------------------------------
-- Entity 1: departments
-- Standardized technical routing groups
-- ----------------------------------------------------------------------------
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- Entity 2: users
-- Represents system users. RBAC restricted to 'Customer' or 'Agent'.
-- Public registration is restricted strictly to 'Customer'.
-- Agents are provisioned via administrative/seed scripts.
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Customer', 'Agent') NOT NULL DEFAULT 'Customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- Entity 3: tickets
-- Primary service request entity.
-- Workflow state transitions: Open -> In-Progress -> Resolved
-- Priority tiers: Low, Medium, High, Critical
-- ----------------------------------------------------------------------------
CREATE TABLE tickets (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    department_id INT NOT NULL,
    resolved_by_agent_id INT NULL,
    title VARCHAR(150) NOT NULL,
    issue_description TEXT NOT NULL,
    ai_category VARCHAR(50) NOT NULL,
    ai_priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
    status ENUM('Open', 'In-Progress', 'Resolved') NOT NULL DEFAULT 'Open',
    suggested_solution TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE RESTRICT,
    FOREIGN KEY (resolved_by_agent_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_status_priority (status, ai_priority),
    INDEX idx_customer (customer_id),
    INDEX idx_department (department_id),
    INDEX idx_resolved_agent (resolved_by_agent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- Entity 4: ai_logs
-- Auditing trail for AI model calls.
-- IMPORTANT: Enforces 1:1 relationship with tickets via UNIQUE(ticket_id).
-- Tracks token usage, latency, and status ('SUCCESS' vs 'FALLBACK').
-- ----------------------------------------------------------------------------
CREATE TABLE ai_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL UNIQUE,
    model_name VARCHAR(50) NOT NULL,
    raw_response TEXT NOT NULL,
    tokens_used INT NOT NULL DEFAULT 0,
    latency_ms INT NOT NULL DEFAULT 0,
    status ENUM('SUCCESS', 'FALLBACK') NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    INDEX idx_ticket_log (ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
