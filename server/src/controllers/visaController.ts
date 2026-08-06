import { Request, Response } from 'express';
import prisma from '../prisma';
import { uploadToS3 } from '../utils/s3Upload';

const serializeVisa = (obj: any) => JSON.parse(JSON.stringify(obj, (key, value) =>
  typeof value === 'bigint' ? Number(value) : value
));

export const getVisas = async (req: Request, res: Response) => {
  try {
    const visas = await prisma.visas.findMany({
      where: { status: 1 },
      include: {
        visa_categories: true,
        locations: true,
      },
    });
    res.json(visas.map(serializeVisa));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch visas' });
  }
};

export const getVisaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const visa = await prisma.visas.findUnique({
      where: { id: Number(id) },
      include: {
        visa_categories: true,
        locations: true,
        users: { select: { fname: true, lname: true, email: true } },
      },
    });

    if (!visa) return res.status(404).json({ error: 'Visa not found' });
    res.json(serializeVisa(visa));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch visa details' });
  }
};

// --- ADMIN DASHBOARD DATA --- //

export const getAdminVisas = async (req: Request, res: Response) => {
  try {
    // 1. Calculate Stats
    const total_visas = await prisma.visas.count();
    const total_active_visas = await prisma.visas.count({ where: { status: 1 } });
    
    // We could calculate booking stats if visas were part of orders.
    // For now, return basic stats matching the hotel format roughly.
    const stats = {
      total_visas,
      total_active_visas,
      total_booking: 0,
      total_booking_amount: 0
    };

    // 2. Fetch Visa List
    const visasData = await prisma.visas.findMany({
      orderBy: { id: 'desc' },
      include: {
        users: { select: { fname: true, lname: true } }, // Agent
        locations: { select: { name: true } }, // Country
        visa_categories: { select: { name: true } } // Category
      }
    });

    // Map data for the frontend table
    const formattedVisas = visasData.map((v, idx) => ({
      sn: idx + 1,
      id: Number(v.id),
      name: v.title,
      category: v.visa_categories?.name || 'Unknown',
      country: v.locations?.name || 'Unknown',
      agent: v.users ? `${v.users.fname || ''} ${v.users.lname || ''}`.trim() : 'Unknown',
      cost: v.cost,
      price_symbol: v.price_symbol,
      status: v.status
    }));

    res.json({ stats, visas: formattedVisas });
  } catch (error) {
    console.error('Error fetching admin visas:', error);
    res.status(500).json({ error: 'Failed to fetch admin visa data' });
  }
};

// --- ADMIN CRUD OPERATIONS --- //

const parseVisaData = (data: any, userId?: any) => {
  const parsed = { ...data };
  if (userId && !parsed.author_id) parsed.author_id = userId;
  
  delete parsed.id;
  delete parsed.users;
  delete parsed.visa_categories;
  delete parsed.locations;
  delete parsed.visa_translations;
  delete parsed.created_at;
  delete parsed.updated_at;
  delete parsed.price_symbol; // not in schema

  if (parsed.cost !== undefined) parsed.cost = parseFloat(parsed.cost) || 0.0;
  
  if (parsed.status !== undefined) {
    const stat = parseInt(parsed.status);
    parsed.status = isNaN(stat) ? 1 : stat;
  }
  
  const catId = parsed.category_id ? BigInt(parsed.category_id) : BigInt(0);
  const countryId = parsed.country_id ? BigInt(parsed.country_id) : null;
  const authorId = parsed.author_id ? BigInt(parsed.author_id) : BigInt(1);

  delete parsed.category_id;
  delete parsed.country_id;
  delete parsed.author_id;

  if (catId) {
    parsed.visa_categories = { connect: { id: catId } };
  }
  if (countryId) {
    parsed.locations = { connect: { id: countryId } };
  }
  if (authorId) {
    parsed.users = { connect: { id: authorId } };
  }

  if (parsed.faqs && typeof parsed.faqs !== 'string') parsed.faqs = JSON.stringify(parsed.faqs);
  if (parsed.includes && typeof parsed.includes !== 'string') parsed.includes = JSON.stringify(parsed.includes);

  return parsed;
};

export const createVisa = async (req: Request, res: Response) => {
  try {
    const data = parseVisaData(req.body, req.user.id);
    let newVisa = await prisma.visas.create({ data });
    const visaId = Number(newVisa.id);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    let needsUpdate = false;
    let updateData: any = {};

    if (files?.features_image?.length) {
      updateData.features_image = await uploadToS3(files.features_image[0], `visas/${visaId}`);
      needsUpdate = true;
    }
    if (files?.meta_img?.length) {
      updateData.meta_img = await uploadToS3(files.meta_img[0], `visas/${visaId}`);
      needsUpdate = true;
    }

    if (needsUpdate) {
      newVisa = await prisma.visas.update({ where: { id: BigInt(visaId) }, data: updateData });
    }

    res.status(201).json(serializeVisa(newVisa));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create visa' });
  }
};

export const updateVisa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = parseVisaData(req.body);
    const visaId = Number(id);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (files?.features_image?.length) {
      data.features_image = await uploadToS3(files.features_image[0], `visas/${visaId}`);
    }
    if (files?.meta_img?.length) {
      data.meta_img = await uploadToS3(files.meta_img[0], `visas/${visaId}`);
    }

    const updatedVisa = await prisma.visas.update({
      where: { id: BigInt(visaId) },
      data
    });
    res.json(serializeVisa(updatedVisa));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update visa' });
  }
};

export const deleteVisa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.visas.delete({
      where: { id: BigInt(id) }
    });
    res.json({ message: 'Visa deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete visa' });
  }
};
