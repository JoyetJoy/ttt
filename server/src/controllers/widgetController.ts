import { Request, Response } from 'express';
import prisma from '../prisma';
import { uploadToS3 } from '../utils/s3Upload';

export const getAdminWidgets = async (req: Request, res: Response) => {
  try {
    const widgets = await prisma.widgets.findMany({
      where: { status: 1 },
      orderBy: { id: 'asc' }
    });
    
    // Parse the BigInt IDs to numbers for JSON serialization
    const formattedWidgets = widgets.map(w => ({
      ...w,
      id: Number(w.id)
    }));

    res.json(formattedWidgets);
  } catch (error) {
    console.error('Error fetching admin widgets:', error);
    res.status(500).json({ error: 'Failed to fetch admin widgets' });
  }
};

/**
 * PUT /api/admin/widget-content/:unique_id
 * Accepts multipart/form-data:
 *   - config_json  : stringified JSON of the widget config/items
 *   - Any number of files with field names that describe where to inject the URL
 *     e.g. "image", "items[0][image]", "tabs[1][icon]"
 */
export const updateWidgetContent = async (req: Request, res: Response) => {
  try {
    const { unique_id } = req.params;

    // Parse the incoming config JSON
    let config: any = null;
    try {
      config = JSON.parse(req.body.config_json || '{}');
    } catch {
      return res.status(400).json({ error: 'Invalid config_json' });
    }

    const files = req.files as Express.Multer.File[];

    // For each uploaded file, upload to S3 and inject the URL into config
    if (files && Array.isArray(files) && files.length > 0) {
      for (const file of files) {
        if (!file) continue;

        const url = await uploadToS3(file, 'widgets');

        // fieldname patterns:
        //   "image"              -> config.image
        //   "items[2][image]"    -> config.items[2].image
        //   "tabs[0][icon]"      -> config.tabs[0].icon
        const parts = file.fieldname
          .replace(/\]/g, '')
          .split('[');

        // Navigate/create nested path and set the value
        let cursor: any = config;
        for (let i = 0; i < parts.length - 1; i++) {
          const key = isNaN(Number(parts[i])) ? parts[i] : Number(parts[i]);
          if (cursor[key] === undefined || cursor[key] === null) {
            // Peek at next key to decide array vs object
            const nextKey = parts[i + 1];
            cursor[key] = isNaN(Number(nextKey)) ? {} : [];
          }
          cursor = cursor[key];
        }
        const lastKey = parts[parts.length - 1];
        cursor[isNaN(Number(lastKey)) ? lastKey : Number(lastKey)] = url;
      }
    }

    // Save to DB
    const dbId = unique_id.startsWith('db_') ? parseInt(unique_id.replace('db_', ''), 10) : null;

    if (dbId) {
      await prisma.widget_contents.update({
        where: { id: dbId },
        data: { widget_content: JSON.stringify(config) }
      });
    }

    res.json({ message: 'Widget content processed successfully', config });
  } catch (error) {
    console.error('Error updating widget content:', error);
    res.status(500).json({ error: 'Failed to update widget content' });
  }
};
