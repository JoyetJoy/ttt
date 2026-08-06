import { Request, Response } from 'express';
import prisma from '../prisma';
import { uploadToS3 } from '../utils/s3Upload';

// Helper to convert BigInts to Numbers
const serializeDestination = (dest: any) => ({
  ...dest,
  id: Number(dest.id),
  author_id: Number(dest.author_id),
});

export const getDestinations = async (req: Request, res: Response) => {
  try {
    const destinationsData = await prisma.destinations.findMany({
      where: { status: 1 },
      orderBy: { id: 'desc' }
    });
    
    // For public API, we might want to return the number of tours per destination.
    // We will do a raw count or just return dummy count if tours don't have destination_id.
    // Looking at the schema, tours has `country_id`, `state_id`, `city_id` mapped to locations.
    // It doesn't map directly to `destinations` table. We'll just return the destinations array.
    
    const formatted = destinationsData.map(d => serializeDestination(d));
    res.json({ destinations: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
};


export const getAdminDestinations = async (req: Request, res: Response) => {
  try {
    const total_destinations = await prisma.destinations.count();
    const total_active_destinations = await prisma.destinations.count({ where: { status: 1 } });
    const total_tours = await prisma.tours.count();
    const total_bookings = await prisma.orders.count();

    const stats = {
      total_destinations,
      total_active_destinations,
      total_tours,
      total_bookings
    };

    const destinationsData = await prisma.destinations.findMany({
      orderBy: { id: 'desc' }
    });

    const formattedDestinations = destinationsData.map((d, idx) => ({
      sn: idx + 1,
      id: Number(d.id),
      name: d.title,
      city: d.city || 'Unknown',
      status: d.status
    }));

    res.json({
      stats,
      destinations: formattedDestinations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
};

export const getDestinationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dest = await prisma.destinations.findUnique({
      where: { id: Number(id) },
      include: {
        destination_galleries: true,
      },
    });

    if (!dest) return res.status(404).json({ error: 'Destination not found' });
    
    const serialized = serializeDestination(dest);
    serialized.destination_galleries = dest.destination_galleries?.map(g => ({
      id: Number(g.id),
      image: g.image
    })) || [];
    
    res.json(serialized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch destination details' });
  }
};

export const createDestination = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };

    data.author_id = (req as any).user?.id || 1; 

    // Handle checkboxes
    if (data.enable_seo) data.enable_seo = String(data.enable_seo);
    
    // Convert status
    if (data.status !== undefined) data.status = Number(data.status);
    
    if (data.attribute_terms !== undefined) delete data.attribute_terms; // frontend-only array

    const newDest = await prisma.destinations.create({
      data: {
        author_id: BigInt(data.author_id),
        meta_title: data.meta_title,
        meta_desc: data.meta_desc,
        meta_img: data.meta_img,
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        content: data.content,
        destination: data.destination,
        population: data.population,
        city: data.city,
        language: data.language,
        currency: data.currency,
        enable_seo: data.enable_seo,
        short_desc: data.short_desc,
        status: data.status !== undefined ? data.status : 1
      }
    });

    const destId = Number(newDest.id);
    let needsUpdate = false;
    let updateData: any = {};

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    
    if (files?.features_image?.length) {
      const url = await uploadToS3(files.features_image[0], `destinations/${destId}`);
      updateData.features_image = url;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.destinations.update({
        where: { id: BigInt(destId) },
        data: updateData
      });
    }

    if (files?.gallery_images?.length) {
      for (const file of files.gallery_images) {
        const url = await uploadToS3(file, `destinations/${destId}/gallery`);
        await prisma.destination_galleries.create({
          data: {
            image: url,
            destination_id: BigInt(destId)
          }
        });
      }
    }

    res.status(201).json({ message: 'Destination created successfully', id: destId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create destination' });
  }
};

export const updateDestination = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    
    // Parse JSON lists
    let deletedGalleries: number[] = [];
    if (data.deletedGalleries) {
      try { deletedGalleries = JSON.parse(data.deletedGalleries); } catch (e) {}
      delete data.deletedGalleries;
    }

    if (deletedGalleries.length > 0) {
      await prisma.destination_galleries.deleteMany({
        where: { id: { in: deletedGalleries.map((id: number) => BigInt(id)) } }
      });
    }

    if (data.enable_seo !== undefined) data.enable_seo = String(data.enable_seo);
    if (data.status !== undefined) data.status = Number(data.status);
    if (data.author_id) delete data.author_id; // don't update author
    if (data.attribute_terms !== undefined) delete data.attribute_terms; // frontend-only array

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    
    if (files?.features_image?.length) {
      const url = await uploadToS3(files.features_image[0], `destinations/${id}`);
      data.features_image = url;
    }

    const updatedDest = await prisma.destinations.update({
      where: { id: Number(id) },
      data
    });

    if (files?.gallery_images?.length) {
      for (const file of files.gallery_images) {
        const url = await uploadToS3(file, `destinations/${id}/gallery`);
        await prisma.destination_galleries.create({
          data: {
            image: url,
            destination_id: BigInt(id)
          }
        });
      }
    }

    res.json({ message: 'Destination updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update destination' });
  }
};

export const deleteDestination = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.destinations.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete destination' });
  }
};
