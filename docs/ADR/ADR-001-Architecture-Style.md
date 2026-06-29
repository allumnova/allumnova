# Architecture Decision Record (ADR) — Modular Monolith to Microservices
**Document ID:** ADR-001  
**Status:** APPROVED  
**Date:** June 2026

---

## 1. Context

An enterprise B2B Platform requires high-integrity database consistency and complex interactions across CRM, Billing, HR, and AI Agent domains. 
Deploying microservices at the start of a project introduces significant operational overhead, including distributed data management (Sagas), network latency, CI/CD complexity, and high developer coordination. 
At the same time, a standard monolith runs the risk of degrading into a "big ball of mud" where domains are tightly coupled, making future scaling difficult.

---

## 2. Decision

We will build the system as a **Modular Monolith**:
- Code is logically divided into domain-specific modules (e.g. `auth`, `billing`, `workflow`, `ai`).
- Communication between modules is restricted to public service classes or internal event emitters.
- A single PostgreSQL database will store all schemas, but modules are structured to avoid cross-domain tables.
- Database tables are partitioned logically via organization ID keys to support eventual migration.

As the platform scales:
- If a specific module (e.g. `workflow` or `ai`) requires independent scaling or resources, it will be extracted into a separate service, communicating via gRPC or REST APIs.

---

## 3. Consequences

### 3.1 Benefits
- **Developer Velocity**: Fast local testing, simple monolithic code compilation.
- **Relational Integrity**: Unified ACID transactions are preserved across database actions.
- **Ease of Deployment**: Single container deployment target (Docker/Kubernetes).

### 3.2 Trade-offs
- **Shared Database Risk**: Care must be taken to prevent direct database queries between tables of different modules.
- **Resource Competition**: An expensive AI task can cause CPU starvation for simple auth requests. CPU limiting policies must be enforced at the process level.
