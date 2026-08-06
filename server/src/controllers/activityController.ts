import { Request, Response } from 'express';
import prisma from '../prisma';
import { uploadToS3 } from '../utils/s3Upload';

const serializeActivity = (activity: any) => {
  const serialized = {
    ...activity,
    id: Number(activity.id),
    author_id: Number(activity.author_id),
    country_id: activity.country_id ? Number(activity.country_id) : null,
    state_id: activity.state_id ? Number(activity.state_id) : null,
    city_id: activity.city_id ? Number(activity.city_id) : null,
    view: Number(activity.view),
  };
  
  if (serialized.activities_galleries) {
    serialized.activities_galleries = serialized.activities_galleries.map((g: any) => ({
      ...g,
      id: Number(g.id),
      activities_id: Number(g.activities_id)
    }));
  }
  
  return serialized;
};

export const getActivities = async (req: Request, res: Response) => {
  try {
    const activities = await prisma.activities.findMany({
      include: {
        activities_galleries: true
      }
    });
    res.json(activities.map(serializeActivity));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

export const getActivityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const activity = await prisma.activities.findUnique({
      where: { id: Number(id) },
      include: {
        users: {
          select: { fname: true, lname: true, email: true },
        },
        activities_galleries: true
      },
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(serializeActivity(activity));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch activity details' });
  }
};

// --- ADMIN CRUD OPERATIONS --- //

export const createActivity = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    data.author_id = req.user.id;
    
    const numFields = ['status', 'days', 'nights', 'min_advance_reservations', 'min_stay', 'max_people', 'enable_service_fee'];
    numFields.forEach(f => {
      if (data[f] !== undefined && data[f] !== '' && data[f] !== 'null') data[f] = Number(data[f]);
      else if (data[f] === '' || data[f] === 'null') data[f] = null;
    });

    const floatFields = ['price', 'sale_price', 'child_price'];
    floatFields.forEach(f => {
      if (data[f]) data[f] = parseFloat(data[f]);
      else if (data[f] === '') data[f] = 0;
    });

    const idFields = ['country_id', 'state_id', 'city_id'];
    idFields.forEach(f => {
      if (data[f]) data[f] = BigInt(data[f]);
      else if (data[f] === '') data[f] = null;
    });
    
    if (data.enable_seo) data.enable_seo = String(data.enable_seo);

    // Filter out internal gallery metadata
    delete data.deletedGalleries;

    const newActivity = await prisma.activities.create({ data });
    const activityId = newActivity.id;

    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const updateData: any = {};

    if (files?.feature_img?.[0]) {
      updateData.feature_img = await uploadToS3(files.feature_img[0], `activities/${activityId}/feature`);
    }
    if (files?.youtube_image?.[0]) {
      updateData.youtube_image = await uploadToS3(files.youtube_image[0], `activities/${activityId}/youtube`);
    }
    if (files?.icon?.[0]) {
      updateData.icon = await uploadToS3(files.icon[0], `activities/${activityId}/icon`);
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.activities.update({
        where: { id: activityId },
        data: updateData
      });
    }

    if (files?.gallery_images?.length) {
      for (const file of files.gallery_images) {
        const url = await uploadToS3(file, `activities/${activityId}/gallery`);
        await prisma.activities_galleries.create({
          data: {
            image: url,
            activities_id: activityId
          }
        });
      }
    }

    res.status(201).json(serializeActivity(newActivity));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
};

export const updateActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const numFields = ['status', 'days', 'nights', 'min_advance_reservations', 'min_stay', 'max_people', 'enable_service_fee'];
    numFields.forEach(f => {
      if (data[f] !== undefined && data[f] !== '' && data[f] !== 'null') data[f] = Number(data[f]);
      else if (data[f] === '' || data[f] === 'null') data[f] = null;
    });

    const floatFields = ['price', 'sale_price', 'child_price'];
    floatFields.forEach(f => {
      if (data[f]) data[f] = parseFloat(data[f]);
      else if (data[f] === '') data[f] = 0;
    });

    const idFields = ['country_id', 'state_id', 'city_id'];
    idFields.forEach(f => {
      if (data[f]) data[f] = BigInt(data[f]);
      else if (data[f] === '') data[f] = null;
    });
    
    if (data.enable_seo) data.enable_seo = String(data.enable_seo);

    let deletedGalleries = [];
    if (data.deletedGalleries) {
      try { deletedGalleries = JSON.parse(data.deletedGalleries); } catch(e){}
      delete data.deletedGalleries;
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files?.feature_img?.[0]) {
      data.feature_img = await uploadToS3(files.feature_img[0], `activities/${id}/feature`);
    }
    if (files?.youtube_image?.[0]) {
      data.youtube_image = await uploadToS3(files.youtube_image[0], `activities/${id}/youtube`);
    }
    if (files?.icon?.[0]) {
      data.icon = await uploadToS3(files.icon[0], `activities/${id}/icon`);
    }

    // Clean up unnecessary fields sent from frontend that will cause Prisma to crash
    delete data.id;
    delete data.author_id;
    delete data.activities_galleries;
    delete data.locations_activities_city_idTolocations;
    delete data.locations_activities_country_idTolocations;
    delete data.locations_activities_state_idTolocations;
    delete data.activities_translations;
    delete data.users;
    delete data.sn;
    delete data.location;
    delete data.category;
    delete data.created_at;
    delete data.updated_at;
    delete data.price_symbol;

    const updatedActivity = await prisma.activities.update({
      where: { id: Number(id) },
      data
    });

    if (deletedGalleries.length > 0) {
      await prisma.activities_galleries.deleteMany({
        where: {
          id: { in: deletedGalleries.map((id: string) => BigInt(id)) },
          activities_id: BigInt(id)
        }
      });
    }

    if (files?.gallery_images?.length) {
      for (const file of files.gallery_images) {
        const url = await uploadToS3(file, `activities/${id}/gallery`);
        await prisma.activities_galleries.create({
          data: {
            image: url,
            activities_id: BigInt(id)
          }
        });
      }
    }

    res.json(serializeActivity(updatedActivity));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
};

export const deleteActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.activities.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
};
