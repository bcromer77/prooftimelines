export type Case = {
  _id: string;
  title?: string;
  name?: string; // depending on your backend
  createdAt?: string;
  updatedAt?: string;
};

export type Event = {
  _id: string;
  caseId: string;
  date: string; // ISO string (Event Time)
  title: string;
  note?: string;
  createdAt?: string; // Capture-ish, but still system time
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

  // immutable metadata
  sha256: string;

  // Capture Time (system axis)
  capturedAt: string;

  // Ledger Order (immutable ordering)
  ledger: EvidenceLedger;

  // relationship
  eventIds?: string[];

  // storage reference
  storageKey?: string;
  url?: string;
};

export type TimelineResponse = {
  case: Case;
  events: Event[];
  evidence: EvidenceItem[];
};

