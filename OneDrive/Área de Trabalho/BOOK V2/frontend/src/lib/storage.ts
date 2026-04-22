// Supabase S3-compatible Storage
// Used ONLY for storing book files and covers

import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const BUCKET = 'Book';
const ENDPOINT = 'https://rcskfvbacvlvwvegvtap.storage.supabase.co/storage/v1/s3';
const PUBLIC_BASE = 'https://rcskfvbacvlvwvegvtap.storage.supabase.co/storage/v1/object/public/Book';

export const s3 = new S3Client({
  region: 'us-east-2',
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_STORAGE_ACCESS_KEY || 'c5d894e41cfd1db07d3442bd547d3c34',
    secretAccessKey: process.env.STORAGE_SECRET_KEY || 'c81cb32002a0ecbe89da8aea5ff3b8436415b94454bcc3a41850ddab9bffc410',
  },
  forcePathStyle: true,
});

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function uploadBookFile(file: File, bookId: string): Promise<{ url: string; key: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
  const key = `books/${bookId}.${ext}`;

  const buffer = await file.arrayBuffer();

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: file.type || 'application/octet-stream',
    ContentLength: file.size,
  }));

  return { url: `${PUBLIC_BASE}/${key}`, key };
}

export async function uploadBookCover(file: File, bookId: string): Promise<{ url: string; key: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const key = `covers/${bookId}.${ext}`;

  const buffer = await file.arrayBuffer();

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: file.type || 'image/jpeg',
    ContentLength: file.size,
  }));

  return { url: `${PUBLIC_BASE}/${key}`, key };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteFile(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listFiles(prefix?: string) {
  const res = await s3.send(new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: prefix,
  }));
  return res.Contents || [];
}

// ─── Presigned URL (for private files) ───────────────────────────────────────

export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });
}

// ─── Public URL helper ────────────────────────────────────────────────────────

export function getPublicUrl(key: string): string {
  return `${PUBLIC_BASE}/${key}`;
}
