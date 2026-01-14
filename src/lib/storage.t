// src/lib/storage.ts
import fs from "fs/promises";
import path from "path";
import https from "https";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";

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

function getClient() {
  const region = process.env.S3_REGION || process.env.AWS_REGION || "auto";
  const endpoint = requireEnv("S3_ENDPOINT");

  return new S3Client({
    region,
    endpoint,
    forcePathStyle: true, // ✅ REQUIRED for Cloudflare R2
    // ✅ FIX: Explicitly handle the HTTPS connection to prevent SSL handshake failures
    requestHandler: new NodeHttpHandler({
      httpsAgent: new https.Agent({
        keepAlive: true,
        // Cloudflare R2 sometimes requires specific TLS versions or rejects default Node handshakes
        minVersion: "TLSv1.2",
      }),
    }),
    credentials: {
      accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
    },
  });
}

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

export async function putObject(args: {
  key: string;
  body: Buffer;
  contentType?: string;
  metadata?: Record<string, string>;
}) {
  if (!hasS3Env()) {
    if (process.env.NODE_ENV === "development") {
      return putLocal(args.key, args.body);
    }
    throw new Error("S3_ENV_MISSING_NO_FALLBACK");
  }

  const Bucket = requireEnv("S3_BUCKET");
  const s3 = getClient();

  await s3.send(
    new PutObjectCommand({
      Bucket,
      Key: args.key,
      Body: args.body,
      ContentType: args.contentType || "application/octet-stream",
      Metadata: args.metadata,
    })
  );

  return { storageRef: args.key };
}

export async function getObjectBuffer(storageRef: string) {
  if (storageRef.startsWith("local:")) {
    return getLocal(storageRef.slice("local:".length));
  }

  if (!hasS3Env()) {
    throw new Error("STORAGE_NOT_CONFIGURED_AND_NOT_LOCAL");
  }

  const Bucket = requireEnv("S3_BUCKET");
  const s3 = getClient();

  const res = await s3.send(
    new GetObjectCommand({ Bucket, Key: storageRef })
  );

  if (!res.Body) throw new Error("S3_EMPTY_BODY");

  const chunks: Buffer[] = [];
  for await (const chunk of res.Body as any) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}
