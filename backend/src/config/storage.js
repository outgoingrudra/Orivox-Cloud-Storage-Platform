import { S3Client } from "@aws-sdk/client-s3";

export const storageClient = new S3Client({
  endpoint: process.env.B2_ENDPOINT,

  region: process.env.B2_REGION,

  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
});

export const STORAGE_BUCKET =
  process.env.B2_BUCKET_NAME;