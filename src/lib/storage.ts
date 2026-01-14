// src/lib/storage.ts
import fs from "fs/promises";
import path from "path";

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`MISSING_ENV_${name}`);
  return v;
}

function hasS3Env() {
  return Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY
  );
}

function getClient() {
  // For R2: set S3_ENDPOINT + S3_REGION="auto"
  // For AWS S3: omit S3_ENDPOINT and set AWS_REGION
  const region = process.env.S3_REGION || process.env.AWS_REGION || "auto";
  const endpoint = process.env.S3_ENDPOINT;

  return new S3Client({
    region,
    endpoint: endpoint || undefined,
    credentials: {
      accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
    },
  });
}

async function putLocal(key: string, body: Buffer) {
  // stores under /storage_dev relative to project root
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

export async function putObject(args: {
  key: string;
  body: Buffer;
  contentType: string;
  metadata?: Record<string, string>;
}) {
  // ✅ Dev fallback: if S3 env not configured, store locally
  if (!hasS3Env()) {
    return putLocal(args.key, args.body);
  }

  const Bucket = requireEnv("S3_BUCKET");
  const s3 = getClient();

  await s3.send(
    new PutObjectCommand({
      Bucket,
      Key: args.key,
      Body: args.body,
      ContentType: args.contentType,
      Metadata: args.metadata,
    })
  );

  return { storageRef: args.key };
}

export async function getObjectBuffer(storageRef: string) {
  // local:... support
  if (storageRef.startsWith("local:")) {
    const key = storageRef.slice("local:".length);
    return getLocal(key);
  }

  if (!hasS3Env()) {
    throw new Error("STORAGE_NOT_CONFIGURED_AND_NOT_LOCAL");
  }

  const Bucket = requireEnv("S3_BUCKET");
  const s3 = getClient();

  const res = await s3.send(new GetObjectCommand({ Bucket, Key: storageRef }));
  if (!res.Body) throw new Error("S3_EMPTY_BODY");

  const chunks: Buffer[] = [];
  for await (const chunk of res.Body as any) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

