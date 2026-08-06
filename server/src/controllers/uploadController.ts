import { Request, Response } from 'express';
import { uploadToS3 } from '../utils/s3Upload';

export const uploadGenericFile = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to generic 'uploads' folder or a specific one passed via body
    const folder = req.body.folder || 'widgets';
    const url = await uploadToS3(file, folder);

    res.json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};
