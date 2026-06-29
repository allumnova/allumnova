# Technical Design Document (TDD) — Database Schema & Data Design
**Document ID:** TDD-001  
**Category:** Persistence Layer  
**Target Engine:** PostgreSQL (15+) + PgVector

---

## 1. Schema Relationship Model

The relational schema uses strict foreign-key scoping to partition data by `Organization`. All data queries must join on `organizationId` to ensure logical tenant isolation.

```
                    ┌──────────────────┐
                    │   Organization   │
                    └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │ (1:N)             │ (1:N)             │ (1:N)
┌────────▼─────────┐┌────────▼─────────┐┌────────▼─────────┐
│       User       ││     Project      ││     Workflow     │
└────────┬─────────┘└────────┬─────────┘└────────┬─────────┘
         │                   │                   │
         │ (1:N)             │ (1:N)             │ (1:N)
┌────────▼─────────┐┌────────▼─────────┐┌────────▼─────────┐
│   AuditLog       ││      Task        ││   StateHistory   │
└──────────────────┘└──────────────────┘└──────────────────┘
```

---

## 2. Core Table Definitions (Dmitri Schema Spec)

### 2.1 Organizations & Subscriptions
```sql
CREATE TABLE organizations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(100) UNIQUE,
    subscription_plan VARCHAR(50) DEFAULT 'FREE', -- FREE, GROWTH, ENTERPRISE
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, DELETED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscription_logs (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) REFERENCES organizations(id) ON DELETE CASCADE,
    previous_plan VARCHAR(50),
    new_plan VARCHAR(50),
    changed_by VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 Users & Permissions
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'MEMBER', -- ADMIN, MANAGER, MEMBER, CLIENT
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_org_email UNIQUE(organization_id, email)
);
```

### 2.3 Workflows & State Machines
```sql
CREATE TABLE workflows (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL, -- EVENT, CRON, MANUAL
    definition JSONB NOT NULL, -- State machine configuration (states, rules, triggers)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workflow_runs (
    id VARCHAR(36) PRIMARY KEY,
    workflow_id VARCHAR(36) REFERENCES workflows(id) ON DELETE CASCADE,
    current_state VARCHAR(100) NOT NULL,
    context_data JSONB,
    status VARCHAR(50) DEFAULT 'RUNNING', -- RUNNING, COMPLETED, FAILED
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);
```

### 2.4 Invoices & Payments
```sql
CREATE TABLE invoices (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) REFERENCES organizations(id) ON DELETE CASCADE,
    client_id VARCHAR(36) REFERENCES users(id),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'UNPAID', -- UNPAID, PAID, OVERDUE, VOID
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    invoice_id VARCHAR(36) REFERENCES invoices(id) ON DELETE CASCADE,
    payment_gateway VARCHAR(50) NOT NULL, -- STRIPE, RAZORPAY, MANUAL
    transaction_reference VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'SUCCESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Embedding Vector Store (`PgVector`)
AI memories, context chunks, and proposal templates are stored as multi-dimensional vectors for fast semantic lookup.
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE ai_knowledge_base (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) REFERENCES organizations(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- GENERAL, CODE, BUSINESS, SALES
    content TEXT NOT NULL,
    embedding VECTOR(1536) NOT NULL, -- Matches OpenAI text-embedding-3-small (1536 dims)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for Fast Cosine Distance (Approximate Nearest Neighbor search)
CREATE INDEX ON ai_knowledge_base USING hnsw (embedding vector_cosine_ops);
```

---

## 4. Performance, Indexing & Audit Log Strategy
- **Index Constraints**: Every query filtering by organization requires a composite index:
  ```sql
  CREATE INDEX idx_users_org ON users (organization_id, id);
  CREATE INDEX idx_workflows_org ON workflows (organization_id, is_active);
  ```
- **Audit Logging**: A system-wide audit table tracking mutations:
  ```sql
  CREATE TABLE audit_logs (
      id BIGSERIAL PRIMARY KEY,
      organization_id VARCHAR(36),
      user_id VARCHAR(36),
      action VARCHAR(100) NOT NULL, -- e.g., 'INVOICE_PAID', 'USER_CREATION'
      table_name VARCHAR(100) NOT NULL,
      record_id VARCHAR(36) NOT NULL,
      old_values JSONB,
      new_values JSONB,
      ip_address VARCHAR(45),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX idx_audit_org_time ON audit_logs (organization_id, created_at DESC);
  ```
