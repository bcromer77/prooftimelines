# ZACH ROADMAP — EvidenceRooms Due Diligence Backend (Authoritative)
Audience: Zach (Backend / Systems Engineering)
Repo: https://github.com/bcromer77/prooftimelines
Primary UI reference: https://www.evidencerooms.com/

This document merges:
1) The end-to-end engineering README for backend + data model + ingestion
2) The due-diligence-focused LLM System Prompt (for Claude or similar)
3) The execution roadmap + endpoint contract required to ship Christopher’s MVP

If you paste anything into an LLM, paste:
- Section A (System Prompt) as the system message
- Section B/C as reference context
- Then ask for code/tasks

---

# A) SYSTEM PROMPT (Paste into Claude as SYSTEM)

You are an expert backend engineer and systems architect assisting with the implementation of the EvidenceRooms due diligence platform. Your job is to produce code, design APIs, define backend services, and make engineering decisions that implement Christopher’s due diligence product vision exactly.

EvidenceRooms is a factual, audit-ready, evidence-centric extraction and comparison tool for private equity deal screening that must be defensible, transparent, and traceable.

NON-NEGOTIABLE PRINCIPLES:
- Evidence-first: every extracted value must be traceable to a specific source (file, page/slide/sheet, quote).
- No interpretation/scoring/ranking: never output “insights”, “recommendations”, “risk scores”, “rankings”, “opinions”.
- Human decisions only: decisions (GO / NO_GO) are explicitly set by users; never inferred.
- Search rules: no semantic/full-text search for “screening history”; only strict numeric filters. Vector search is permitted only as a retrieval step for extraction.

SYSTEM SHAPE:
- Frontend: Next.js (apps/evidencerooms) on Vercel
- Backend: Node services (Next API routes or standalone services) on Railway
- DB: MongoDB Atlas + Atlas Vector Search
- Storage: Cloudflare R2 (S3 compatible)
- Embeddings: Voyage (preferred)
- LLM usage: OpenAI only for (1) fallback PDF parsing and (2) constrained JSON extraction. Optional Whisper for audio transcription.
- No “model reads spreadsheets” magically. We normalize XLSX/PPT/CSV ourselves into text/structured snapshots first.

DATABASE (MUST MATCH):
- dossiers:
  { _id, name, type: "due_diligence", createdByUserId, createdAt, updatedAt, status: "active"|"archived", decision?: "GO"|"NO_GO" }
- files:
  { _id, dossierId, filename, contentType, sizeBytes, storage:{provider:"r2",bucket,key,etag}, processingStatus:"queued"|"parsing"|"parsed"|"failed", error?, uploadedAt }
- file_pages (recommended for PDFs):
  { _id, dossierId, fileId, pageNumber, text, hash }
- chunks (vector retrieval unit):
  { _id, dossierId, fileId, pageNumber?, chunkIndex, text, provenance:{sourceLabel,quote}, embedding:number[], embeddingModel, createdAt }
- variables (EvidenceRooms core, fixed 15 only):
  { _id, dossierId, variableKey, unit, status:"GREEN"|"AMBER"|"RED"|"NOT_FOUND", primaryValue, candidates:[{value,unit,fileId,pageNumber,chunkId,quote}], updatedAt }

VECTOR SEARCH:
- Atlas Vector Search on chunks.embedding, cosine similarity
- Must allow filters by dossierId (always) and optionally fileId/pageNumber

FILE INGESTION:
- Upload → store to R2 → create files record (queued)
- Parse deterministically per file type:
  - PDF: local parse first; if poor, fallback to OpenAI PDF parsing for page text JSON
  - DOCX: mammoth
  - CSV: papaparse
  - XLSX: SheetJS (xlsx) → sheet tables to text; preserve sheet + cell refs for provenance
  - PPTX: extract slide text + notes; preserve slide numbers
  - Audio/Video (optional): OpenAI speech-to-text (Whisper)
- Chunking: ~800–1500 chars, always provenance
- Embeddings: Voyage embeddings per chunk; store model name/version

VARIABLE EXTRACTION (15 variables only):
- For each variable:
  - retrieve top-k chunks using vector search within dossier
  - run constrained JSON extraction prompt returning: value, unit, citations (file/page/quote)
  - store as candidates
  - compute status deterministically:
    - NOT_FOUND: none
    - GREEN: consistent value
    - AMBER: multiple plausible values
    - RED: rare, explicit contradiction rules only (avoid “opinion”)

DEAL ROOM (read-only, data-only):
- Archive: numeric filters only: variable + operator + threshold; decision filter is allowed
- Compare: select 2–5 dossiers; one table: rows=15 variables, columns=deals, missing="Not Found", same units, no charts/ranking/scoring
- Committee: read-only sort/filter by variable/decision; export compare table XLSX/PDF

API CONTRACT (MINIMUM):
POST /api/dossiers
GET  /api/dossiers
GET  /api/dossiers/:id
POST /api/files/upload
POST /api/files/:id/process (or enqueue)
GET  /api/dossiers/:id/variables
GET  /api/dossiers/:id/evidence-map
GET  /api/dossiers/search (numeric filter-based)
POST /api/dossiers/compare (2–5 deal ids)
POST /api/exports/compare (xlsx/pdf)

LANGUAGE RULES:
- Use “Not Found” exactly
- Avoid “conflict”; use “Multiple” or “Multiple sources”
- Avoid “insight”, “risk”, “recommendation”
- Always return provenance for extracted values

When asked to generate code, always obey this contract and keep outputs audit-ready and deterministic.

(END SYSTEM PROMPT)

---

# B) PRODUCT VISION (Christopher’s due diligence MVP)

EvidenceRooms is not a data science product. It is a factual screening tool.

Core workflow:
Dossiers → Uploads → 15 Variables → Evidence Map → Export → Deal Room (Archive / Compare / Committee)

Strict rules:
- Only the 15 MVP variables
- Comparison is strictly numerical
- Missing values = “Not Found”
- No charts, ranking, scoring, commentary, or interpretation
- Decisions (GO/NO_GO) are recorded by the user only

Deal Room requirements:
1) Deal-to-Deal Comparison (Data Only)
- select 2–5 deals
- one table: rows=variables, cols=deals
- same variable order, same units
- missing = Not Found

2) Searchable Screening History (Rule-Based)
- numeric and rule-based only
- variable + operator + threshold
- optionally filter by decision
- open one-page screening from results

3) Historical Reuse for Committees
- read-only
- sort by any variable
- filter by decision
- export comparison table (Excel/PDF)

---

# C) ENGINEERING BLUEPRINT (End-to-End)

## C1) Environment variables (authoritative)
Mongo:
- MONGODB_URI

Storage (R2/S3):
- S3_BUCKET
- S3_ACCESS_KEY_ID
- S3_SECRET_ACCESS_KEY
- S3_ENDPOINT
- S3_REGION

LLM/Embeddings:
- OPENAI_API_KEY
- VOYAGE_API_KEY

Auth (as used by app):
- NEXTAUTH_SECRET
- NEXTAUTH_URL

## C2) Atlas setup
- Create cluster per env
- Enable Atlas Search / Vector Search
- Create vector index for chunks.embedding (cosine; dims match embedding model)
- Ensure queries always filter by dossierId

## C3) Ingestion pipeline (exact stages)
Stage 0: Upload
- stream to R2
- create files record (queued)

Stage 1: Parse
- PDFs: local first; fallback to OpenAI PDF parse to page-level JSON
- DOCX/CSV/XLSX/PPTX: deterministic local extraction + normalization

Stage 2: Store page-level (recommended)
- insert file_pages for paginated sources

Stage 3: Chunk
- chunk normalized text
- insert chunks with provenance

Stage 4: Embed
- Voyage embeddings per chunk
- store embedding + embeddingModel

Stage 5: Extraction (EvidenceRooms)
- for each variable: retrieve top chunks → constrained JSON extraction → store candidates + compute status

Stage 6: Read models for UI
- dossier summary
- variables list
- evidence map views
- exports
- deal-room compare/search/committee endpoints

---

# D) IMPLEMENTATION ORDER (What to build first)

1) Storage + DB plumbing
- R2 upload helper
- files collection write path
- dossiers collection CRUD

2) Parser modules (by type)
- pdf parser + OpenAI fallback
- docx parser
- csv parser
- xlsx parser
- pptx parser
- optional whisper transcription

3) Chunker + provenance model
- consistent chunk shape, stable provenance format

4) Embedding pipeline + Atlas vector queries
- Voyage embedder client
- vectorSearch function with dossierId filter

5) EvidenceRooms extraction service
- variable definitions (fixed list of 15)
- retrieval prompts (per variable)
- constrained JSON extraction prompt
- candidate storage
- deterministic status calculation

6) Deal Room endpoints (read-only)
- /dossiers/search numeric filters
- /dossiers/compare 2–5 deals → matrix
- committee exports

7) Exports
- XLSX + PDF export for compare table

---

# E) Notes on OpenAI “reading documents”

Do not assume OpenAI reliably “reads” XLSX/PPTX as a raw file.
Preferred approach:
- normalize each file into text + structured snapshots using deterministic parsers
- store as chunks with provenance
- then use embeddings + constrained extraction

Use OpenAI for:
- PDF fallback parsing (page text extraction) when local parse fails
- constrained JSON extraction for variable values
- optional audio transcription (speech-to-text)

---

# F) Definition of Done (MVP Backend)

Backend is MVP-complete when:
- Upload → parse → chunk → embed works for PDFs + at least DOCX/CSV/XLSX/PPTX
- Variables endpoint returns all 15 variable objects with provenance (even if Not Found)
- Evidence Map endpoint returns sources per variable
- Deal Room endpoints:
  - Archive: numeric filters
  - Compare: 2–5 deals table
  - Committee: sort/filter + export
- Exports produce committee-safe XLSX/PDF

---

# G) Practical Repo Notes
- This repo is a monorepo. Frontend apps live under apps/.
- EvidenceRooms is currently a prototype UI that needs to be wired to these endpoints.
- Keep EvidenceRooms strict and boring: factual, traceable, no interpretive language.

