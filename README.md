 ProofTimeline

**ProofTimeline** is a chronology-first evidence system.

It exists to do one thing:

> Render time honestly so humans can see when things stop lining up.

This is **not**:
- a legal conclusions engine  
- a truth engine  
- an AI judge  

It is a system for **chronological integrity**.

---

## Product Definition (LOCKED)

### Core Purpose

**ProofTimeline establishes where, when, and how claims stop matching over time — using evidence-backed chronological intelligence.**

The system never declares who is right or wrong.  
It only shows **when alignment changes**.

---

### Operating Model (LOCKED)

**T0–T4 Timeline States**

- **T0** — Baseline context  
- **T1** — First recorded event / claim  
- **T2** — Subsequent events  
- **T3** — Chronological sequencing  
- **T4** — Points where alignment changes  

**Pipeline**

Evidence → Events → Timeline → Alignment Changes → Exportable Proof

markdown
Copy code

✅ Concept is consistent across code, routes, and structure  
🟢 **LOCKED**

---

## Architecture & Stack Contract

### Core Rule

**Vercel renders the dashboard UI. Railway runs the dashboard engine.**  
MongoDB and storage are **never accessed directly from the browser**.

---

### Stack

#### Vercel — Frontend
- Hosts:
  - `www.prooftimeline.com` (marketing)
  - `app.prooftimeline.com` (dashboard UI)
- Responsibilities:
  - Render UI (Cases, Timeline, Export)
  - Authentication UX
  - Call backend APIs
- Must NOT:
  - Access MongoDB directly
  - Store evidence binaries

#### Railway — Backend
- Hosts backend services (recommended: `api.prooftimeline.com`)
- Responsibilities:
  - API routes (cases, events, timeline, uploads, export)
  - Evidence ingestion:
    - `sha256`
    - `capturedAt`
    - ledger sequencing + hash chain
  - Upload binaries to object storage
  - Persist metadata in MongoDB

#### MongoDB Atlas
- Stores:
  - Users, Cases, Events
  - Evidence metadata + ledger chain
  - Storage references (bucket/key/provider)
- Does NOT store binaries

#### Cloudflare
- DNS + TLS
- WAF / rate limiting
- Optional R2 object storage (S3-compatible)

#### OpenAI (Optional / Deferred)
- Assistive layer only (search, summarisation)
- **Not required for V1 GTM**

---

### Upload Flow (NON-NEGOTIABLE)

Browser (Vercel)
→ Railway API
→ hash + ledger
→ Object Storage (R2 / S3)
→ MongoDB (metadata only)

yaml
Copy code

Upload time is **never treated as factual time**.

---

### Three Timelines Rule (LOCKED)

ProofTimeline maintains three distinct axes:

1. **Event Time** — when something happened (truth axis)  
2. **Capture Time** — when evidence entered the system (system axis)  
3. **Ledger Order** — immutable upload sequence (integrity axis)  

- Timeline ordering = `Event.date`
- Evidence ordering = `ledger.sequenceNumber`

---

## GTM Readiness Checklist (Daily, Cross-Referenced)

> **GTM definition:**  
> ProofTimeline is GTM-ready when you can  
> **Upload evidence → see a timeline → export a defensible proof pack**

---

### 1. Evidence Uploads (FOUNDATIONAL)

**GTM requires**
- Upload files  
- Hash evidence (immutability)  
- Prevent duplicates  
- Store metadata  
- Link evidence → case → timeline  

**Status**
- ✅ `POST /api/cases/[caseId]/evidence`
- ✅ SHA-256 hashing
- ✅ Duplicate detection (hash-based)
- ✅ Storage abstraction layer
- ⚠️ Storage is local/dev only

**Verdict**  
🟡 Functionally complete — **production storage pending**

---

### 2. Visual Timelines (CRITICAL)

**GTM requires**
- Ordered timeline by Event Time  
- Events aligned to evidence  
- Clear T0–T4 model  
- API usable by frontend timeline UI  

**Status**
- ✅ `GET /api/cases/[caseId]/timeline`
- ✅ Event ordering logic
- ✅ Clean Timeline DTO
- 🟡 Frontend timeline UI scaffolded (REM-style nav + TimelineView)

**Verdict**  
🟡 Backend ready — **frontend refinement ongoing**

---

### 3. Export Packs (NON-NEGOTIABLE)

**GTM requires**
- Export case as:
  - JSON (minimum)
  - PDF / ZIP later
- Include:
  - Case context
  - Timeline
  - Evidence metadata
  - Hash chain

**Status**
- ❌ No `/export` API yet
- ❌ No pack assembler
- ❌ No audit envelope

**Verdict**  
🔴 **HARD BLOCKER FOR GTM**

---

## Secondary (Optional for V1, Important for Sales)

### 4. Audit-Friendly Summaries

**GTM requires**
- Human-readable case summary
- Clear alignment changes
- Plain-English narrative (“what changed, when”)

**Status**
- ❌ Not implemented
- ❌ No summarisation layer

**Verdict**  
🟡 Not required for MVP demo — required for enterprise GTM

---

### 5. Similarity / Contradiction Views

**Status**
- ❌ Not implemented
- ❌ No vector search

**Verdict**  
⚪ Explicitly deferred — acceptable

---

## Platform & Infrastructure

### Authentication
- 🟡 NextAuth partially wired
- ⚠️ Dev auth fallback in place

**Verdict**  
🟡 Demo-ready — not production-ready

---

### Case Management
- ✅ `POST /api/cases`
- ✅ `GET /api/cases`
- ✅ User isolation enforced

**Verdict**  
🟢 READY

---

### Events (Claims Over Time)
- ✅ `POST /api/cases/[caseId]/events`
- ✅ `GET /api/cases/[caseId]/events`
- ✅ Evidence references supported

**Verdict**  
🟢 READY

---

### Mongo / Data Layer
- ✅ MongoDB connected
- ✅ Health checks
- ⚠️ No indexes
- ⚠️ No migrations

**Verdict**  
🟡 Production hardening needed

---

## Deployment / Ops

### CI / Deployment
- ❌ Railway build unstable
- ❌ Production env vars incomplete
- ❌ Auth dependency mismatch

**Verdict**  
🔴 **HARD BLOCKER**

---

## GTM Readiness Scorecard

| Area | Status |
|---|---|
| Evidence Uploads | 🟡 |
| Timeline API | 🟡 |
| Export Packs | 🔴 |
| Audit Summaries | ⚪ |
| Similarity Views | ⚪ |
| Auth | 🟡 |
| Deployment | 🔴 |

---

## 🚨 HARD GTM BLOCKERS (MUST FIX)

1. **Export Pack API**
   - `/api/cases/[caseId]/export`
   - Deterministic payload
   - Hash-verified

2. **Production Storage**
   - R2 / S3 / GCS
   - Signed URLs

3. **Deployment Stability**
   - Green Railway build
   - Auth dependency alignment

---

## Philosophy (LOCKED)

ProofTimeline is not about being right.  
It is about **showing when things stop matching over time**.

