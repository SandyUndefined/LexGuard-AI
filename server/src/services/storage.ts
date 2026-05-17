import { Storage } from '@google-cloud/storage';
import { config } from '../config';

let storage: Storage | null = null;

function getStorage(): Storage {
  if (!storage) {
    storage = new Storage({ projectId: config.gcp.project });
  }
  return storage;
}

export async function uploadFileToBucket(
  localBuffer: Buffer,
  destFileName: string,
  mimeType: string,
): Promise<string> {
  const gcs = getStorage();
  const bucket = gcs.bucket(config.gcs.bucketName);
  const file = bucket.file(destFileName);

  await file.save(localBuffer, {
    metadata: { contentType: mimeType },
    resumable: false,
  });

  // Make the file publicly readable (or use signed URLs for production)
  await file.makePublic();

  return `https://storage.googleapis.com/${config.gcs.bucketName}/${destFileName}`;
}

export async function deleteFile(fileName: string): Promise<void> {
  const gcs = getStorage();
  const bucket = gcs.bucket(config.gcs.bucketName);
  await bucket.file(fileName).delete({ ignoreNotFound: true });
}
