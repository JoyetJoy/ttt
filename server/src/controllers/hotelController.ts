import { Request, Response } from 'express';
import prisma from '../prisma';
import { uploadToS3 } from '../utils/s3Upload';

// Helper to convert BigInts to Numbers
const serializeHotel = (hotel: any) => ({
  ...hotel,
  id: Number(hotel.id),
  author_id: Number(hotel.author_id),
  country_id: hotel.country_id ? Number(hotel.country_id) : null,
  state_id: hotel.state_id ? Number(hotel.state_id) : null,
  city_id: hotel.city_id ? Number(hotel.city_id) : null,
  view: Number(hotel.view),
});

export const getHotels = async (req: Request, res: Response) => {
  try {
    const hotels = await prisma.hotels.findMany();
    res.json(hotels.map(serializeHotel));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
};

export const getHotelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hotel = await prisma.hotels.findUnique({
      where: { id: Number(id) },
      include: {
        users: { select: { fname: true, lname: true, email: true } },
        hotel_galleries: true,
      },
    });

    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
    
    // Serialize hotel galleries as well
    const serialized = serializeHotel(hotel);
    serialized.hotel_galleries = hotel.hotel_galleries?.map(g => ({
      id: Number(g.id),
      image: g.image
    })) || [];
    
    res.json(serialized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch hotel details' });
  }
};

// --- ADMIN DASHBOARD DATA --- //

export const getAdminHotels = async (req: Request, res: Response) => {
  try {
    // 1. Calculate Stats
    const total_hotels = await prisma.hotels.count();
    const total_active_hotels = await prisma.hotels.count({ where: { status: 1 } });
    
    const ordersAgg = await prisma.orders.aggregate({
      where: { product_type: { in: ['hotel', '2', 'Hotel'] } },
      _count: { id: true },
      _sum: { total_amount: true, total_with_tax: true }
    });

    const total_booking = ordersAgg._count.id;
    const total_booking_amount = ordersAgg._sum.total_with_tax || ordersAgg._sum.total_amount || 0;

    const stats = {
      total_hotels,
      total_active_hotels,
      total_booking,
      total_booking_amount
    };

    // 2. Fetch Hotel List
    const hotelsData = await prisma.hotels.findMany({
      orderBy: { id: 'desc' },
      include: {
        users: { select: { fname: true, lname: true } }, // Agent
        locations_hotels_country_idTolocations: { select: { name: true } }, // Location
        locations_hotels_city_idTolocations: { select: { name: true } }, // Location
      }
    });

    // Map data for the frontend table
    const formattedHotels = hotelsData.map((h, idx) => ({
      sn: idx + 1,
      id: Number(h.id),
      name: h.title,
      // Attempt to build a location string (City, Country)
      location: [
        h.locations_hotels_city_idTolocations?.name, 
        h.locations_hotels_country_idTolocations?.name
      ].filter(Boolean).join(', ') || h.address || 'Unknown',
      agent: h.users ? `${h.users.fname || ''} ${h.users.lname || ''}`.trim() : 'Unknown',
      price: h.price,
      price_symbol: h.price_symbol,
      reviews: 0,
      status: h.status
    }));

    res.json({ stats, hotels: formattedHotels });
  } catch (error) {
    console.error('Error fetching admin hotels:', error);
    res.status(500).json({ error: 'Failed to fetch admin hotel data' });
  }
};

// --- ADMIN CRUD OPERATIONS --- //

const parseHotelData = (data: any, userId?: any) => {
  const parsed = { ...data };
  if (userId && !parsed.author_id) parsed.author_id = userId;
  
  // Strip relations and readonly fields that might come from the frontend
  delete parsed.id;
  delete parsed.users;
  delete parsed.locations_hotels_city_idTolocations;
  delete parsed.locations_hotels_country_idTolocations;
  delete parsed.locations_hotels_state_idTolocations;
  delete parsed.created_at;
  delete parsed.updated_at;
  delete parsed.hotel_galleries; // we will handle gallery separately

  if (parsed.price !== undefined) parsed.price = parseFloat(parsed.price) || 0.0;
  if (parsed.guest_capability !== undefined) parsed.guest_capability = parseInt(parsed.guest_capability) || 1;
  if (parsed.min_advance_reservations !== undefined) parsed.min_advance_reservations = parseInt(parsed.min_advance_reservations) || null;
  if (parsed.min_stay !== undefined) parsed.min_stay = parseInt(parsed.min_stay) || null;
  if (parsed.breakfast !== undefined) parsed.breakfast = parseInt(parsed.breakfast) || 2;
  if (parsed.enable_service_fee !== undefined) parsed.enable_service_fee = parseInt(parsed.enable_service_fee) || 2;
  
  if (parsed.status !== undefined) {
    const stat = parseInt(parsed.status);
    parsed.status = isNaN(stat) ? 1 : stat;
  }
  
  // Handle optional foreign keys safely for partial updates
  if (parsed.country_id !== undefined) parsed.country_id = parsed.country_id ? BigInt(parsed.country_id) : null;
  if (parsed.state_id !== undefined) parsed.state_id = parsed.state_id ? BigInt(parsed.state_id) : null;
  if (parsed.city_id !== undefined) parsed.city_id = parsed.city_id ? BigInt(parsed.city_id) : null;

  // Handle JSON stringification for text columns, they might come as strings from FormData
  // but if they are valid JSON arrays, stringify them. If they are already strings, just leave them.
  // Wait, FormData sends everything as strings. The payload will be `"[...]"`.
  // Prisma needs it as a string for `LongText`. So if it's already a string, it's fine.
  if (parsed.policies && typeof parsed.policies !== 'string') parsed.policies = JSON.stringify(parsed.policies);
  if (parsed.service_fees && typeof parsed.service_fees !== 'string') parsed.service_fees = JSON.stringify(parsed.service_fees);
  if (parsed.attribute_terms && typeof parsed.attribute_terms !== 'string') parsed.attribute_terms = JSON.stringify(parsed.attribute_terms);

  return parsed;
};

export const createHotel = async (req: Request, res: Response) => {
  try {
    const data = parseHotelData(req.body, req.user.id);
    
    // Create hotel first to get ID for S3 folder
    let newHotel = await prisma.hotels.create({ data });
    const hotelId = Number(newHotel.id);

    // Handle File Uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    let needsUpdate = false;
    let updateData: any = {};

    if (files?.feature_img?.length) {
      const url = await uploadToS3(files.feature_img[0], `hotels/${hotelId}`);
      updateData.feature_img = url;
      needsUpdate = true;
    }

    if (files?.youtube_image?.length) {
      const url = await uploadToS3(files.youtube_image[0], `hotels/${hotelId}`);
      updateData.youtube_image = url;
      needsUpdate = true;
    }

    if (needsUpdate) {
      newHotel = await prisma.hotels.update({
        where: { id: BigInt(hotelId) },
        data: updateData
      });
    }

    if (files?.gallery_images?.length) {
      for (const file of files.gallery_images) {
        const url = await uploadToS3(file, `hotels/${hotelId}/gallery`);
        await prisma.hotel_galleries.create({
          data: {
            hotel_id: BigInt(hotelId),
            image: url
          }
        });
      }
    }

    res.status(201).json(serializeHotel(newHotel));
  } catch (error) {
    console.error('Create Hotel Error:', error);
    res.status(500).json({ error: 'Failed to create hotel' });
  }
};

export const updateHotel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = parseHotelData(req.body);

    // Handle File Uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    
    if (files?.feature_img?.length) {
      const url = await uploadToS3(files.feature_img[0], `hotels/${id}`);
      data.feature_img = url;
    }

    if (files?.youtube_image?.length) {
      const url = await uploadToS3(files.youtube_image[0], `hotels/${id}`);
      data.youtube_image = url;
    }

    const updatedHotel = await prisma.hotels.update({
      where: { id: Number(id) },
      data
    });

    if (files?.gallery_images?.length) {
      for (const file of files.gallery_images) {
        const url = await uploadToS3(file, `hotels/${id}/gallery`);
        await prisma.hotel_galleries.create({
          data: {
            hotel_id: BigInt(id),
            image: url
          }
        });
      }
    }

    // Process deleted gallery images
    if (req.body.deleted_galleries) {
      try {
        const deletedIds = JSON.parse(req.body.deleted_galleries);
        if (Array.isArray(deletedIds) && deletedIds.length > 0) {
          await prisma.hotel_galleries.deleteMany({
            where: {
              id: { in: deletedIds.map(Number) },
              hotel_id: BigInt(id) // Security check
            }
          });
        }
      } catch (e) {
        console.error('Failed to parse deleted_galleries', e);
      }
    }

    res.json(serializeHotel(updatedHotel));
  } catch (error) {
    console.error('Update Hotel Error:', error);
    res.status(500).json({ error: 'Failed to update hotel' });
  }
};

export const deleteHotel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.hotels.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete hotel' });
  }
};
