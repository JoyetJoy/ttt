import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const endpoint = process.env.DO_SPACES_ENDPOINT || '';
const region = process.env.DO_SPACES_REGION || 'us-east-1';
const bucket = process.env.DO_SPACES_BUCKET || '';
const key = process.env.DO_SPACES_KEY || '';
const secret = process.env.DO_SPACES_SECRET || '';

const s3 = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId: key,
    secretAccessKey: secret,
  },
  forcePathStyle: false, 
});

/**
 * Uploads a file to DO Spaces
 * @param file The Multer file object
 * @param folder The folder path (e.g. 'hotels/123')
 * @returns The public URL of the uploaded file
 */
export const uploadToS3 = async (file: Express.Multer.File, folder: string): Promise<string> => {
  if (!file) throw new Error('No file provided');

  const extension = file.originalname.split('.').pop();
  const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${extension}`;
  const keyPath = `${folder}/${filename}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: keyPath,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  });

  await s3.send(command);
  
  const domain = endpoint.replace(/^https?:\/\//, '');
  const publicUrl = `https://${bucket}.${domain}/${keyPath}`;
  
  return publicUrl;
};
