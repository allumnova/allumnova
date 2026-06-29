# Technical Design Document (TDD) — AI Agent System & AI Gateway
**Document ID:** TDD-002  
**Category:** Artificial Intelligence Architecture  
**Target LLM Engines:** OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Local Llama 3

---

## 1. Architectural Topology

The AI Gateway decouples clients from specific LLM APIs. It orchestrates routing, caching, retrieval-augmented generation (RAG), and cost telemetry.

```
 Client (UI/Agent)
       │
       ▼
 [AI Gateway Routing Middleware]
       │
       ├────────► [Prompt Template Engine & Injection]
       │
       ├────────► [RAG Vector Search (PgVector)]
       │
       ▼
 [LLM Provider Interface] ◄──► [Cache Lookup (Redis / Semantic Cache)]
       │
       ├────────► OpenAI (GPT-4o)
       ├────────► Anthropic (Claude 3.5)
       └────────► Local Models (Llama-3-70B via vLLM)
```

---

## 2. API Schema / Routing Specification

### 2.1 Route Mapping
- `POST /api/ai/chat`: Interactive stateful agent conversation.
- `POST /api/ai/proposal/generate`: Background async generation of formal service proposals.
- `POST /api/ai/requirements/extract`: Natural language feature parsing to structured JSON state definitions.

### 2.2 Ingestion / Request Payload Structure
```json
{
  "agentId": "PM_AGENT",
  "sessionId": "conv_987654321",
  "context": {
    "organizationId": "org_12345",
    "projectId": "proj_abcde"
  },
  "message": {
    "role": "user",
    "content": "Analyze the customer email feedback and generate structural tasks for the engineering team."
  },
  "options": {
    "temperature": 0.2,
    "maxTokens": 1500
  }
}
```

---

## 3. RAG & Prompt Management

### 3.1 Prompt Management and Versioning
Prompts are defined as templates stored in the database (`ai_prompts`) and cached in Redis. Variables are injected in real-time.
```sql
CREATE TABLE ai_prompts (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'REQUIREMENTS_EXTRACTOR'
    template TEXT NOT NULL,
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 Semantic Caching
To reduce LLM latency and cost:
- Inbound query embeddings are matched against a Redis Vector database storing previous answers.
- If the cosine similarity of the embedding matches a cached query with >0.96 confidence, the cached answer is returned immediately (sub-15ms response).

---

## 4. Multi-Agent Systems & Framework Logic

The system utilizes an autonomous **ReAct (Reasoning and Acting)** agent framework built with LangGraph:

```
  ┌────────► [Analyze Intent & Memory]
  │                 │
  │                 ▼
  │          [Call Tool?]
  │           /        \
  │       (Yes)        (No)
  │         /            \
  │        ▼              ▼
[Execute db/workflow tool]  [Respond to client]
  │                               ▲
  └───────────────────────────────┘
```

### 4.1 Built-in Agents
1. **Business Consultant**: Analyzes organizational documents, proposes operational adjustments, and scopes solutions.
2. **Project Manager**: Auto-creates tasks, estimates delivery times, assigns task milestones, and alerts on potential SLA breaks.
3. **Sales Agent**: Automatically drafts pricing estimations and scopes project quotes based on PDF requirement uploads.

---

## 5. Security, Logging, and Rate Limits
- **Plaform Sanitization**: PII (Personally Identifiable Information) masking middleware intercepts inputs, replacing names, credit cards, or passwords with safe placeholders before querying third-party APIs.
- **Tokens Logging**: Every LLM interaction writes to the database for billing:
  ```sql
  CREATE TABLE ai_token_metrics (
      id BIGSERIAL PRIMARY KEY,
      organization_id VARCHAR(36) NOT NULL,
      agent_id VARCHAR(50) NOT NULL,
      prompt_tokens INT NOT NULL,
      completion_tokens INT NOT NULL,
      estimated_cost_usd DECIMAL(10, 6) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  ```
- **Tenant Constraints**: Monthly token thresholds configured in tenant metadata prevent token exhaustion exploits.
