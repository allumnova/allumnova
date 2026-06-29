# Architecture Decision Record (ADR) — Event-Driven Core & Background Job Processing
**Document ID:** ADR-003  
**Status:** APPROVED  
**Date:** June 2026

---

## 1. Context

Heavy operational tasks (generating signed invoice PDFs, querying LLMs, sending verification codes, calculating metrics) block the main API thread. 
If these tasks are executed synchronously inside API routes, client requests experience high latency, timeout risks, and low concurrency thresholds. 
We need a robust, low-latency queuing system that offers transaction safety, retries, and rate limits.

---

## 2. Decision

We will implement an **Event-Driven Architecture (EDA)** utilizing **BullMQ** running on **Redis**:
- API controllers validate requests and write transactions to PostgreSQL.
- Heavy workloads are converted to structured payloads and pushed as jobs to Redis queues.
- Asynchronous Background Workers listen on Redis queues, pull jobs, execute operations, and write results back to PostgreSQL.
- Real-time updates of job completion are signaled to client browsers using **Socket.io**.

---

## 3. Consequences

### 3.1 Benefits
- **Non-Blocking API**: API routes respond immediately (typically <50ms), delegating heavier processes to background workers.
- **Fail-Safe Retries**: Built-in exponential backoff retries prevent temporary errors (e.g. SMTP server timeout) from failing the transaction.
- **Concurrency Control**: BullMQ can rate-limit worker tasks, preventing third-party API rate limiting issues.

### 3.2 Trade-offs
- **Complexity**: Introduction of asynchronous programming patterns. Frontends must support loading/polling state indicators or listen to WebSocket event updates.
- **Redis Dependency**: Redis acts as a critical infrastructure piece; a cache failure will halt background task operations. We must configure Redis replication or persistence.
