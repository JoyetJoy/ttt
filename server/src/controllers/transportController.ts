import { Request, Response } from 'express';
import prisma from '../prisma';
import { uploadToS3 } from '../utils/s3Upload';

const serializeTransport = (transport: any) => {
  let car_price = transport.car_price || 0;
  let car_sale_price = transport.car_sale_price || 0;
  let car_person = transport.car_person ? Number(transport.car_person) : null;
  
  if (transport.pricing_vehicles) {
    try {
      const pricing = JSON.parse(transport.pricing_vehicles);
      if (Array.isArray(pricing) && pricing.length > 0) {
        const first = pricing[0];
        if (first.price) car_price = Number(first.price);
        if (first.sale_price) car_sale_price = Number(first.sale_price);
        if (first.capacity) car_person = Number(first.capacity);
      }
    } catch (e) {
      console.error("Failed to parse pricing_vehicles", e);
    }
  }

  return {
    ...transport,
    id: Number(transport.id),
    author_id: Number(transport.author_id),
    country_id: transport.country_id ? Number(transport.country_id) : null,
    state_id: transport.state_id ? Number(transport.state_id) : null,
    city_id: transport.city_id ? Number(transport.city_id) : null,
    car_person,
    car_price,
    car_sale_price,
    view: Number(transport.view),
  };
};

export const getTransports = async (req: Request, res: Response) => {
  try {
    const transports = await prisma.transports.findMany({
      where: { status: 1 },
      include: {
        locations_transports_city_idTolocations: { select: { name: true } },
        locations_transports_country_idTolocations: { select: { name: true } }
      }
    });
    res.json(transports.map(serializeTransport));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch transports' });
  }
};

export const getTransportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transport = await prisma.transports.findUnique({
      where: { id: Number(id) },
      include: {
        users: {
          select: { fname: true, lname: true, email: true },
        },
        transport_galleries: true
      },
    });

    if (!transport) {
      return res.status(404).json({ error: 'Transport not found' });
    }

    const serialized = serializeTransport(transport);
    serialized.transport_galleries = transport.transport_galleries?.map((g: any) => ({
      ...g,
      id: Number(g.id),
      transport_id: Number(g.transport_id)
    })) || [];

    res.json(serialized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch transport details' });
  }
};

// --- ADMIN CRUD OPERATIONS --- //

export const getAdminTransports = async (req: Request, res: Response) => {
  try {
    const total_transports = await prisma.transports.count();
    const total_active_transports = await prisma.transports.count({ where: { status: 1 } });
    
    // Stub stats
    const total_booking = 0;
    const total_booking_amount = 0;

    const stats = {
      total_transports,
      total_active_transports,
      total_booking,
      total_booking_amount
    };

    const transportsData = await prisma.transports.findMany({
      orderBy: { id: 'desc' },
      include: {
        locations_transports_city_idTolocations: { select: { name: true } },
        users: { select: { fname: true, lname: true } }
      }
    });

    const formattedTransports = transportsData.map((t, idx) => ({
      sn: idx + 1,
      id: Number(t.id),
      name: t.title,
      location: t.locations_transports_city_idTolocations?.name || t.address || 'Unknown',
      agent: t.users ? `${t.users.fname || ''} ${t.users.lname || ''}`.trim() : 'Unknown',
      price: t.pricing_vehicles ? (JSON.parse(t.pricing_vehicles)[0]?.price || 0) : 0, // generic fallback for list
      status: t.status
    }));

    res.json({ stats, transports: formattedTransports });
  } catch (error) {
    console.error('Error fetching admin transports:', error);
    res.status(500).json({ error: 'Failed to fetch admin transports data' });
  }
};

export const createTransport = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    data.author_id = (req as any).user.id;
    
    const numFields = ['status', 'enable_service_fee'];
    numFields.forEach(f => {
      if (data[f] !== undefined && data[f] !== '' && data[f] !== 'null') data[f] = Number(data[f]);
      else if (data[f] === '' || data[f] === 'null') data[f] = null;
    });

    const floatFields = [];
    floatFields.forEach(f => {
      if (data[f]) data[f] = parseFloat(data[f]);
      else if (data[f] === '') data[f] = 0.00;
    });

    const idFields = ['country_id', 'state_id', 'city_id'];
    idFields.forEach(f => {
      if (data[f]) data[f] = BigInt(data[f]);
      else if (data[f] === '') data[f] = null;
    });

    if (data.enable_seo) data.enable_seo = String(data.enable_seo);

    // Clean up relation objects and un-updatable fields that might be passed from frontend
    delete data.deletedGalleries;
    delete data.id;
    delete data.users;
    delete data.transport_galleries;
    delete data.created_at;
    delete data.updated_at;
    if (data.view) data.view = BigInt(data.view);

    const newTransport = await prisma.transports.create({ data });
    const transportId = newTransport.id;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const updateData: any = {};

    if (files?.feature_img && files.feature_img.length > 0) {
      updateData.feature_img = await uploadToS3(files.feature_img[0], 'transports');
    }
    if (files?.meta_img && files.meta_img.length > 0) {
      updateData.meta_img = await uploadToS3(files.meta_img[0], 'transports');
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.transports.update({
        where: { id: transportId },
        data: updateData
      });
    }

    if (files?.gallery_images && files.gallery_images.length > 0) {
      const galleryUploads = files.gallery_images.map(file => uploadToS3(file, 'transports/gallery'));
      const galleryUrls = await Promise.all(galleryUploads);
      
      const galleryData = galleryUrls.map(url => ({
        transport_id: transportId,
        image: url
      }));
      
      if (galleryData.length > 0) {
        await prisma.transport_galleries.createMany({ data: galleryData });
      }
    }

    res.status(201).json(serializeTransport(newTransport));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create transport' });
  }
};

export const updateTransport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const numFields = ['status', 'enable_service_fee'];
    numFields.forEach(f => {
      if (data[f] !== undefined && data[f] !== '' && data[f] !== 'null') data[f] = Number(data[f]);
      else if (data[f] === '' || data[f] === 'null') data[f] = null;
    });

    const floatFields = [];
    floatFields.forEach(f => {
      if (data[f]) data[f] = parseFloat(data[f]);
      else if (data[f] === '') data[f] = 0.00;
    });

    const idFields = ['country_id', 'state_id', 'city_id'];
    idFields.forEach(f => {
      if (data[f]) data[f] = BigInt(data[f]);
      else if (data[f] === '') data[f] = null;
    });

    if (data.enable_seo) data.enable_seo = String(data.enable_seo);

    const deletedGalleries = data.deletedGalleries ? JSON.parse(data.deletedGalleries) : [];
    
    // Clean up relation objects and un-updatable fields that might be passed from frontend
    delete data.deletedGalleries;
    delete data.id;
    delete data.users;
    delete data.transport_galleries;
    delete data.created_at;
    delete data.updated_at;
    if (data.author_id) data.author_id = BigInt(data.author_id);
    if (data.view) data.view = BigInt(data.view);

    // Delete legacy pricing fields so we don't try to save them as strings
    const legacyFields = ['car_price', 'car_sale_price', 'train_price', 'train_sale_price', 'train_child_price', 'bus_price', 'bus_sale_price', 'bus_child_price', 'boat_price', 'boat_sale_price', 'boat_child_price', 'min_advance_reservations', 'min_stay', 'car_type', 'car_person'];
    legacyFields.forEach(f => delete data[f]);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files?.feature_img && files.feature_img.length > 0) {
      data.feature_img = await uploadToS3(files.feature_img[0], 'transports');
    }
    if (files?.meta_img && files.meta_img.length > 0) {
      data.meta_img = await uploadToS3(files.meta_img[0], 'transports');
    }

    const updatedTransport = await prisma.transports.update({
      where: { id: Number(id) },
      data
    });

    if (deletedGalleries.length > 0) {
      await prisma.transport_galleries.deleteMany({
        where: { id: { in: deletedGalleries.map((did: any) => Number(did)) }, transport_id: Number(id) }
      });
    }

    if (files?.gallery_images && files.gallery_images.length > 0) {
      const galleryUploads = files.gallery_images.map(file => uploadToS3(file, 'transports/gallery'));
      const galleryUrls = await Promise.all(galleryUploads);
      
      const galleryData = galleryUrls.map(url => ({
        transport_id: Number(id),
        image: url
      }));
      
      if (galleryData.length > 0) {
        await prisma.transport_galleries.createMany({ data: galleryData });
      }
    }

    res.json(serializeTransport(updatedTransport));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update transport' });
  }
};

export const deleteTransport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.transports.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Transport deleted successfully' });
  } catch (error) {
    console.error('Error deleting transport:', error);
    res.status(500).json({ error: 'Failed to delete transport' });
  }
};

export const getVehicleTypes = async (req: Request, res: Response) => {
  try {
    const types = await prisma.vehicle_types.findMany({
      orderBy: { id: 'desc' }
    });
    
    // We need to serialize the BigInt ids to numbers
    const serializedTypes = types.map(t => ({
      ...t,
      id: Number(t.id)
    }));
    
    res.json(serializedTypes);
  } catch (error) {
    console.error('Error fetching vehicle types:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle types' });
  }
};


export const getTransportLocations = async (req: Request, res: Response) => {
  try {
    const locations = await prisma.transport_locations.findMany({
      orderBy: { id: 'desc' }
    });
    
    const serializedLocations = locations.map(t => ({
      ...t,
      id: Number(t.id)
    }));
    
    res.json(serializedLocations);
  } catch (error) {
    console.error('Error fetching transport locations:', error);
    res.status(500).json({ error: 'Failed to fetch transport locations' });
  }
};

