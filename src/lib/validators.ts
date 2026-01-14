// src/lib/validators.ts
import { z } from "zod";

export const CreateCaseSchema = z
  .object({
    title: z.string().min(1).max(120),
  })
  .strict();

export const EventCreateSchema = z
  .object({
    occurredAt: z.string().datetime(), // ISO string
    title: z.string().min(1).max(200),
    note: z.string().max(5000).optional().nullable(),
    sourceType: z.enum(["NOTE", "EMAIL", "MESSAGE", "DOCUMENT", "PHOTO", "OTHER"]),
    sourceRef: z.string().max(500).optional().nullable(),
  })
  .strict();

