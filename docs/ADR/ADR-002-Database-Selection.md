# Architecture Decision Record (ADR) — Database & Storage Engine Selection
**Document ID:** ADR-002  
**Status:** APPROVED  
**Date:** June 2026

---

## 1. Context

An Enterprise Operating System handles transactional business data (Invoices, Subscriptions, Audits) and semantic unstructured data (AI context files, vector embeddings). 
We need a data layer that guarantees ACID consistency, provides high indexing throughput, supports low-latency queries, and offers vector search capabilities without introducing the complexity of maintaining multiple separate databases (e.g. Postgres for SQL, Pinecone for Vectors, MongoDB for JSON).

---

## 2. Decision

We will use a streamlined storage stack:
1. **PostgreSQL** as the primary relational and JSON data store.
2. **PgVector extension** inside PostgreSQL to handle semantic embedding storage and HNSW index searches.
3. **Redis** as a low-latency key-value store, cache layer, and message broker for BullMQ.

---

## 3. Consequences

### 3.1 Benefits
- **Simplified Maintenance**: Reduced operational cost by avoiding a separate Vector DB and Document DB. Postgres handles SQL, JSONB, and Vectors efficiently.
- **Transactional Consistency**: Relational database queries and vector embeddings can be updated or rolled back within a single SQL transaction block.
- **High-Performance Caching**: Redis ensures sub-millisecond session checking and rapid message routing.

### 3.2 Trade-offs
- **Postgres Scale Constraints**: PgVector query performance on extremely large datasets (e.g., hundreds of millions of embeddings) can degrade CPU performance. If embedding datasets scale significantly, vector indexing will be offloaded to dedicated nodes or replica databases.
