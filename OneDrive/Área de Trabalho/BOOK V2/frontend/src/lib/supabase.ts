// NOTE: The Supabase REST API (supabase-js) is NOT used.
// All book storage uses the S3-compatible API directly via @aws-sdk/client-s3.
// See src/lib/storage.ts

// Re-export storage helpers for backwards compatibility
export { uploadBookFile, uploadBookCover, deleteFile, getPublicUrl } from './storage';
