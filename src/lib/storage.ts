// src/lib/storage.ts

import fs from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import https from "https";


function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`MISSING_ENV_${name}`);
  return v;
}

function hasS3Env() {
  return Boolean(
    process.env.S3_BUCKET &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY &&
    process.env.S3_ENDPOINT
  );
}

/**
 * Configures the S3 Client for Cloudflare R2.
 * R2 requires region: "auto" and forcePathStyle: true.
 */
function getClient() {
  const endpoint = requireEnv("S3_ENDPOINT");

  const agent = new https.Agent({
    keepAlive: true,
    minVersion: "TLSv1.2",
  });

  return new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle: true,
    requestHandler: new NodeHttpHandler({
      httpsAgent: agent,
    }),
    credentials: {
      accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
    },
  });
}

/* ---------- Local Development Fallback ---------- */

async function putLocal(key: string, body: Buffer) {
  const root = path.join(process.cwd(), "storage_dev");
  const full = path.join(root, key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, body);
  return { storageRef: `local:${key}` };
}

async function getLocal(key: string) {
  const root = path.join(process.cwd(), "storage_dev");
  const full = path.join(root, key);
  return fs.readFile(full);
}

/* ---------- Public API ---------- */

export async function putObject(args: {
  key: string;
  body: Buffer;
  contentType?: string;
  metadata?: Record<string, string>;
}) {
  const FORCE_LOCAL = process.env.STORAGE_FORCE_LOCAL === "1";
  if (FORCE_LOCAL && process.env.NODE_ENV === "development") {
    console.log("[storage] STORAGE_FORCE_LOCAL=1; using local storage");
    return putLocal(args.key, args.body);
  }

  // If R2 env vars are missing, use local storage in dev mode
  if (!hasS3Env()) {
    if (process.env.NODE_ENV === "development") {
      console.log("[storage] S3 env missing, falling back to local storage");
      return putLocal(args.key, args.body);
    }
    throw new Error("S3_ENV_MISSING_NO_FALLBACK");
  }

  const Bucket = requireEnv("S3_BUCKET");
  const s3 = getClient();

  try {
    console.log("[storage] Attempting PutObject to R2...");
    await s3.send(
      new PutObjectCommand({
        Bucket,
        Key: args.key,
        Body: args.body,
        ContentType: args.contentType || "application/octet-stream",
        Metadata: args.metadata,
      })
    );
    console.log("[storage] PutObject succeeded:", args.key);
    return { storageRef: args.key };
  } catch (err: any) {
    console.error("[storage] PutObject failed:", err.message);
    throw err;
  }
}

