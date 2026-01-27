import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    hasBucket: Boolean(process.env.S3_BUCKET),
    hasKey: Boolean(process.env.S3_ACCESS_KEY_ID),
    hasSecret: Boolean(process.env.S3_SECRET_ACCESS_KEY),
    region: process.env.S3_REGION || process.env.AWS_REGION || null,
    endpoint: process.env.S3_ENDPOINT || null,
    bucket: process.env.S3_BUCKET || null,
  });
}

