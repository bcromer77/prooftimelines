// src/lib/ledger.ts
import crypto from "crypto";

export function sha256Hex(input: string | Buffer) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function computeLedgerHash(args: {
  prevHash: string;
  evidenceSha256: string;
  capturedAtIso: string;
  userId: string;
  caseId: string;
}) {
  const { prevHash, evidenceSha256, capturedAtIso, userId, caseId } = args;
  return sha256Hex(`${prevHash}${evidenceSha256}${capturedAtIso}${userId}${caseId}`);
}

