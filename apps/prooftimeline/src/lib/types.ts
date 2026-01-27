export type Case = {
  _id: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ListCasesResponse = {
  cases: Array<{
    _id?: string;
    id?: string;
    title?: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
};

export type CreateCaseResponse = {
  caseId: string;
};

export type Event = {
  _id: string;
  caseId: string;
  date: string; // ISO string (Event Time)
  title: string;
  note?: string | null;
  createdAt?: string;
};

export type EvidenceLedger = {
  sequenceNumber: number;
  prevHash?: string | null;
  hash: string;
};

export type EvidenceItem = {
  _id: string;
  caseId: string;
  fileName: string;
  mimeType?: string;
  size?: number;

  sha256: string;
  capturedAt: string;

  ledger: EvidenceLedger;

  eventIds?: string[];

  storageKey?: string;
  url?: string;
};

export type TimelineResponse = {
  case: Case;
  events: Event[];
  evidence: EvidenceItem[];
};

