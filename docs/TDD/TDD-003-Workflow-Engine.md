# Technical Design Document (TDD) — State Machine & Workflow Engine
**Document ID:** TDD-003  
**Category:** Business Logic & Process Automation  
**Target Runtime:** Node.js + BullMQ + Redis Event Bus

---

## 1. State Machine Mechanics

The Workflow Engine coordinates actions by transitioning processes through predefined states based on user mutations, timer events, or external webhook calls.

```
       [Start Node]
            │
            ▼
    ┌───────────────┐
    │  State: DRAFT │ ◄── [User Edits Document]
    └───────┬───────┘
            │
            │ (Trigger: "SUBMIT_FOR_REVIEW")
            ▼
    ┌───────────────┐
    │ State: REVIEW │
    └───────┬───────┘
            ├────────────────────────┐
            │ (Approval: Approved)   │ (Approval: Rejected)
            ▼                        ▼
    ┌───────────────┐        ┌───────────────┐
    │ State: ACTIVE │        │ State: DRAFT  │
    └───────────────┘        └───────────────┘
```

---

## 2. Transition Definition Schema

A workflow is stored in a JSON configuration block defining the layout of states, transitions, validation rules, and automatic webhooks.

### 2.1 JSON Schema Structure
```json
{
  "workflowId": "wf_invoice_approval_v1",
  "initialState": "DRAFT",
  "states": {
    "DRAFT": {
      "on": {
        "SUBMIT_FOR_APPROVAL": {
          "target": "PENDING_APPROVAL",
          "conditions": ["checkAmountLimit"],
          "actions": ["notifyApproverGroup", "logAuditAction"]
        }
      }
    },
    "PENDING_APPROVAL": {
      "on": {
        "APPROVE": {
          "target": "APPROVED",
          "conditions": ["checkUserIsApprover"],
          "actions": ["generateCryptographicPdfSign", "notifyClient"]
        },
        "REJECT": {
          "target": "REJECTED",
          "actions": ["notifyCreatorOfRejection"]
        }
      }
    },
    "APPROVED": {
      "type": "final"
    },
    "REJECTED": {
      "on": {
        "EDIT": {
          "target": "DRAFT"
        }
      }
    }
  }
}
```

---

## 3. Automation Task Engine & BullMQ Scheduler

Automated workflow steps (e.g. executing clean database checks, firing API requests, or calculating pricing metrics) are processed asynchronously to prevent API thread locking.

```
[REST Controller]
      │
      ├─► Validate state transition schema
      ├─► Write transaction to PostgreSQL DB
      │
      └─► Push automation job to Redis Queue (BullMQ)
                                  │
                                  ▼
                     [Distributed Node Workers]
                                  │
                                  ├─► Action: notifyApprover()
                                  ├─► Action: callThirdPartyWebhook()
                                  └─► Complete job status in cache
```

---

## 4. SLA Tracking & SLA Escalation Architecture

SLAs (Service Level Agreements) are governed by Redis Sorted Sets containing expiration dates as scores:
1. When a task transitions to `PENDING_APPROVAL`, a check-in event is scheduled in Redis:
   - Key: `sla:tracker`
   - Score: Unix timestamp of the SLA deadline (e.g. current time + 24 hours).
   - Member: `workflow_run_id`
2. A background cron job checks the sorted set every 60 seconds:
   - Queries items with scores less than the current Unix timestamp.
   - For every expired item, a BullMQ task runs to process the escalation (e.g. notify manager, re-route task, log SLA violation).
3. If the task is approved before the deadline, the item is removed from the sorted set.
