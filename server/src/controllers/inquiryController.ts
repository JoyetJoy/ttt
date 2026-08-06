import { Request, Response } from 'express';
import prisma from '../prisma';

const serializeBigInt = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = serializeBigInt(obj[key]);
    }
    return newObj;
  }
  return obj;
};

export const submitInquiry = async (req: Request, res: Response) => {
  try {
    const { type, product_id, name, email, phone, message } = req.body;
    
    let author_id = null;
    // req.user might be present if they use an optional auth middleware, but since
    // submitInquiry is likely a public route, we might not enforce auth token.
    if ((req as any).user && (req as any).user.id) {
      author_id = BigInt((req as any).user.id);
    }

    const inquiry = await prisma.inquiries.create({
      data: {
        type: type || 'General',
        product_id: String(product_id || ''),
        name,
        email,
        phone: phone || '',
        message: message || '',
        author_id
      }
    });
    
    res.status(201).json({ success: true, message: 'Inquiry submitted successfully', inquiry: serializeBigInt(inquiry) });
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
};

export const getInquiries = async (req: Request, res: Response) => {
  try {
    const inquiries = await prisma.inquiries.findMany({
      orderBy: { id: 'desc' }
    });

    const enrichedInquiries = await Promise.all(inquiries.map(async (inq) => {
      let productDetails = null;
      try {
        const productIdNum = Number(inq.product_id);
        if (!isNaN(productIdNum)) {
          if (inq.type === 'Tour') {
            const tour = await prisma.tours.findUnique({ where: { id: productIdNum } });
            if (tour) productDetails = { title: tour.title, image: tour.features_image, slug: tour.slug };
          } else if (inq.type === 'Transport') {
            const transport = await prisma.transports.findUnique({ where: { id: productIdNum } });
            if (transport) productDetails = { title: transport.title, image: transport.feature_img, slug: transport.slug };
          } else if (inq.type === 'Visa') {
            const visa = await prisma.visas.findUnique({ where: { id: productIdNum } });
            if (visa) productDetails = { title: visa.title, image: visa.features_image, slug: visa.id.toString() };
          } else if (inq.type === 'Activity') {
            const activity = await prisma.activities.findUnique({ where: { id: productIdNum } });
            if (activity) productDetails = { title: activity.title, image: activity.feature_img, slug: activity.slug };
          }
        }
      } catch (e) {
        console.error('Error fetching product details for inquiry', inq.id, e);
      }
      return { ...inq, product: productDetails };
    }));

    res.json(serializeBigInt(enrichedInquiries));
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
};

export const getInquiryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inquiry = await prisma.inquiries.findUnique({
      where: { id: BigInt(id) }
    });

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    let productDetails = null;
    try {
      const productIdNum = Number(inquiry.product_id);
      if (!isNaN(productIdNum)) {
        if (inquiry.type === 'Tour') {
          const tour = await prisma.tours.findUnique({ where: { id: productIdNum } });
          if (tour) productDetails = { title: tour.title, image: tour.features_image, slug: tour.slug };
        } else if (inquiry.type === 'Transport') {
          const transport = await prisma.transports.findUnique({ where: { id: productIdNum } });
          if (transport) productDetails = { title: transport.title, image: transport.feature_img, slug: transport.slug };
        } else if (inquiry.type === 'Visa') {
          const visa = await prisma.visas.findUnique({ where: { id: productIdNum } });
          if (visa) productDetails = { title: visa.title, image: visa.features_image, slug: visa.id.toString() };
        } else if (inquiry.type === 'Activity') {
          const activity = await prisma.activities.findUnique({ where: { id: productIdNum } });
          if (activity) productDetails = { title: activity.title, image: activity.feature_img, slug: activity.slug };
        }
      }
    } catch (e) {
      console.error('Error fetching product details for inquiry', inquiry.id, e);
    }

    res.json(serializeBigInt({ ...inquiry, product: productDetails }));
  } catch (error) {
    console.error('Error fetching inquiry by id:', error);
    res.status(500).json({ error: 'Failed to fetch inquiry details' });
  }
};

export const updateInquiryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const inquiry = await prisma.inquiries.update({
      where: { id: BigInt(id) },
      data: { status: Number(status) }
    });

    res.json({ message: 'Inquiry status updated successfully', inquiry: serializeBigInt(inquiry) });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({ error: 'Failed to update inquiry status' });
  }
};
