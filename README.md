README — ProofTimelines & EvidenceRooms

Audience: Zach (Backend / Systems Engineering)
Purpose: End-to-end system design, no ambiguity

0. READ THIS FIRST (Non-negotiables)

This system is evidence-first, deterministic, and audit-safe.

Things we DO NOT DO:

❌ No scoring

❌ No ranking

❌ No “AI insights”

❌ No opinions

❌ No inferred decisions

❌ No silent transformations

Things we DO:

✅ Store raw evidence

✅ Preserve provenance (file, page, quote)

✅ Extract only fixed variables

✅ Use embeddings only for retrieval

✅ Keep decisions explicitly human-set

If something feels “smart” or “helpful”, it is probably wrong.

1. MONOREPO OVERVIEW

This repo contains two apps, one backend architecture.

apps/
  prooftimeline/     # Core product (chronology, ledger, storage)
  evidencerooms/     # Due diligence UI (15 variables, deal room)
packages/            # Optional shared code later


Frontend: Vercel (UI only)

Backend services: Railway (or similar)

Database: MongoDB Atlas

Storage: Cloudflare R2 (S3 compatible)

Embeddings: Voyage (preferred)

Parsing / LLM: OpenAI

2. ENVIRONMENT VARIABLES (AUTHORITATIVE)

These must exist in all backend services.

MongoDB
MONGODB_URI=

Storage (Cloudflare R2 / S3-compatible)
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_ENDPOINT=
S3_REGION=

LLM / Embeddings
OPENAI_API_KEY=
VOYAGE_API_KEY=

Auth (depending on implementation)
NEXTAUTH_SECRET=
NEXTAUTH_URL=

3. MONGODB ATLAS — DATA MODEL (LOCKED)
Database

Use one database per environment:

prooftimelines_dev

prooftimelines_staging

prooftimelines_prod

3.1 dossiers

Represents a deal / case container.

{
  _id,
  name,
  type: "due_diligence" | "timeline",
  createdByUserId,
  createdAt,
  updatedAt,
  status: "active" | "archived",

  // EvidenceRooms only
  decision?: "GO" | "NO_GO"  // MUST be explicitly set by user
}

3.2 files

One record per uploaded file.

{
  _id,
  dossierId,
  filename,
  contentType,
  sizeBytes,

  storage: {
    provider: "r2",
    bucket,
    key,
    etag
  },

  processingStatus: "queued" | "parsing" | "parsed" | "failed",
  error?: string,

  uploadedAt
}

3.3 file_pages (PDFs strongly recommended)

Page-level traceability.

{
  _id,
  dossierId,
  fileId,
  pageNumber,
  text,
  hash,
  tokens?
}

3.4 chunks (VECTOR SEARCH UNIT)

This is the atomic retrieval object.

{
  _id,
  dossierId,
  fileId,
  pageNumber?,      // page / slide / sheet row reference
  chunkIndex,

  text,
  charStart?,
  charEnd?,

  provenance: {
    sourceLabel,    // "Contract.pdf p.12"
    quote           // short verbatim excerpt
  },

  embedding: number[],     // OR Atlas-managed vector
  embeddingModel,          // "voyage-3-large" etc
  createdAt
}

3.5 variables (EvidenceRooms core)

Exactly 15 fixed variables.
No more, no less.

{
  _id,
  dossierId,
  variableKey,     // enum of the 15
  unit,

  status: "GREEN" | "AMBER" | "RED" | "NOT_FOUND",

  primaryValue,

  candidates: [
    {
      value,
      unit,
      fileId,
      pageNumber,
      chunkId,
      quote
    }
  ],

  updatedAt
}

4. ATLAS VECTOR SEARCH

Collection: chunks

Field: embedding

Similarity: cosine

Dimensions: must match embedding model

Filterable fields:

dossierId

fileId

pageNumber

Embeddings are retrieval only, never interpretation.

5. INGESTION PIPELINE (END-TO-END)
Step 0 — Upload

Frontend uploads file

Backend streams to R2

Create files record (queued)

Step 1 — Parsing (by file type)
PDFs

Two-tier strategy:

Attempt local parse:

pdf-parse or pdfjs-dist

If text quality is poor:

Send PDF to OpenAI

Request page-level extracted text JSON

Store output in file_pages.

DOCX

Use mammoth

Preserve paragraph structure

CSV

Use papaparse

Convert to text blocks

Preserve headers

XLS / XLSX

Use xlsx (SheetJS)

Convert each sheet to structured text

Preserve cell references (A1 etc)

PPT / PPTX

Extract slide titles, bullet text, speaker notes

Preserve slide numbers

Do not rely on OpenAI to “read PPTs”

Audio / Video (optional)

Use OpenAI Speech-to-Text (Whisper)

Store transcript like any other document

Step 2 — Chunking

Chunk size: ~800–1500 chars

Always attach provenance

Insert into chunks

Step 3 — Embeddings

Use Voyage embeddings (preferred)

Store model name + version

Write vector to Atlas

6. VARIABLE EXTRACTION (EvidenceRooms)

This is not analysis, only extraction.

Process per variable:

Vector search relevant chunks

Run constrained extraction prompt

Output JSON only:

value

unit

citations

Store in variables.candidates

Compute status deterministically

Decision (GO / NO_GO) is NEVER inferred.

7. DEAL ROOM (READ-ONLY)
Archive

Numeric filters only

Example:

NetDebt / EBITDA > 4

Return dossier list

Compare (2–5 dossiers)

Rows = variables

Columns = dossiers

Missing = Not Found

No charts, no scoring

Committee

Read-only

Sort / filter

Export XLSX / PDF

8. BACKEND ENDPOINTS (MINIMUM)
POST   /api/dossiers
GET    /api/dossiers
GET    /api/dossiers/:id

POST   /api/files/upload
POST   /api/files/:id/process

GET    /api/dossiers/:id/variables
GET    /api/dossiers/:id/evidence-map

POST   /api/dossiers/compare
GET    /api/dossiers/search

POST   /api/exports/compare

9. DEPLOYMENT MODEL

Frontend: Vercel

apps/prooftimeline

apps/evidencerooms

Backend workers: Railway

DB: MongoDB Atlas

Storage: Cloudflare R2

10. ENGINEERING PRIORITY (ORDER)

Upload → R2 → Mongo record

Parsing per file type

Chunking

Embeddings + vector search

Variable extraction

Deal Room endpoints

Export

11. FINAL NOTE TO ZACH

This system is designed to be:

boring

calm

defensible

explainable to lawyers and committees

If it ever feels “clever”, stop and reassess.
