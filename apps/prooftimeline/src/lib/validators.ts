// src/lib/validators.ts
import { z } from "zod";

export const CreateCaseSchema = z
  .object({
    title: z.string().min(1).max(120),
  })
  .strict();

/**
 * Canonical event time field: `date`
 * - this is the real-world time axis.
 * - UI sends ISO string (we pin date-only inputs to noon UTC client-side).
 *
 * sourceType/sourceRef are optional in V1.
 * (we can enforce them later once the UX is wired.)
 */
export const EventCreateSchema = z
  .object({
    date: z.string().datetime(), // ISO string
    title: z.string().min(1).max(200),
    note: z.string().max(5000).optional().nullable(),
    sourceType: z
      .enum(["NOTE", "EMAIL", "MESSAGE", "DOCUMENT", "PHOTO", "OTHER"])
      .optional()
      .default("NOTE"),
    sourceRef: z.string().max(500).optional().nullable(),
  })
  .strict();

