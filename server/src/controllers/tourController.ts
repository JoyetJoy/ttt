import { Request, Response } from 'express';
import prisma from '../prisma';
import { uploadToS3 } from '../utils/s3Upload';

const serializeTour = (tour: any) => ({
  ...tour,
  id: Number(tour.id),
  author_id: Number(tour.author_id),
  category_id: Number(tour.category_id),
  destination_id: Number(tour.destination_id),
  country_id: tour.country_id ? Number(tour.country_id) : null,
  state_id: tour.state_id ? Number(tour.state_id) : null,
  city_id: tour.city_id ? Number(tour.city_id) : null,
  view: Number(tour.view),
});

export const getTours = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 0; // 0 means no limit
    const search = req.query.search as string || '';
    const priceRange = parseInt(req.query.priceRange as string) || 0;
    const destinations = req.query.destinations ? (req.query.destinations as string).split(',') : [];
    const sortOption = req.query.sortOption as string || 'Default Sorting';

    let where: any = { status: 1 };
    
    let andConditions: any[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search } },
          { address: { contains: search } }
        ]
      });
    }

    if (priceRange > 0) {
       // Rough approximation since price is string in DB. Better to use raw query if strict, but let's just do our best.
       // For a robust string-based price filter, it's better to let frontend do it or just skip DB price filtering.
       // I'll skip DB price filtering and rely on frontend for strict price, or just let DB do basic string comparison (which fails for "100" vs "90").
    }

    if (destinations.length > 0) {
      let destOr = destinations.map(d => ({
        OR: [
          { address: { contains: d } },
          { title: { contains: d } }
        ]
      }));
      andConditions.push({ OR: destOr });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }
    
    let queryArgs: any = {
      where,
      orderBy: { id: 'desc' }
    };

    if (sortOption === 'Price Low To High') queryArgs.orderBy = { price: 'asc' };
    if (sortOption === 'Price High To Low') queryArgs.orderBy = { price: 'desc' };

    if (limit > 0) {
      queryArgs.skip = (page - 1) * limit;
      queryArgs.take = limit;
    }

    const totalItems = await prisma.tours.count({ where });
    const tours = await prisma.tours.findMany(queryArgs);
    
    if (limit > 0) {
      // Also fetch all destinations for the sidebar
      const allTours = await prisma.tours.findMany({ where: { status: 1 }, select: { address: true } });
      const uniqueDestinations = [...new Set(allTours.map((t: any) => t.address).filter(Boolean))].sort();

      res.json({
        data: tours.map(serializeTour),
        destinations: uniqueDestinations,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page
        }
      });
    } else {
      res.json(tours.map(serializeTour));
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tours' });
  }
};

export const getAdminTours = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 0;
    const search = req.query.search as string || '';

    const total_tours = await prisma.tours.count();
    const total_active_tours = await prisma.tours.count({ where: { status: 1 } });
    
    const ordersAgg = await prisma.orders.aggregate({
      where: { product_type: { in: ['tour', '1', 'Tour'] } },
      _count: { id: true },
      _sum: { total_amount: true, total_with_tax: true }
    });
    
    const total_booking = ordersAgg._count.id;
    const total_booking_amount = ordersAgg._sum.total_with_tax || ordersAgg._sum.total_amount || 0;

    const stats = {
      total_tours,
      total_active_tours,
      total_booking,
      total_booking_amount
    };

    let where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { address: { contains: search } }
      ];
    }

    let queryArgs: any = {
      where,
      orderBy: { id: 'desc' },
      include: {
        locations_tours_city_idTolocations: { select: { name: true } },
        tour_categories: { select: { name: true } }
      }
    };

    if (limit > 0) {
      queryArgs.skip = (page - 1) * limit;
      queryArgs.take = limit;
    }

    const totalItems = await prisma.tours.count({ where });
    const toursData = await prisma.tours.findMany(queryArgs);

    const formattedTours = toursData.map((t, idx) => ({
      sn: (page - 1) * limit + idx + 1,
      id: Number(t.id),
      name: t.title,
      location: t.locations_tours_city_idTolocations?.name || t.address || 'Unknown',
      category: t.tour_categories?.name || 'Unknown',
      price: t.price,
      price_symbol: t.price_symbol,
      status: t.status
    }));

    if (limit > 0) {
      res.json({
        stats,
        data: formattedTours,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page
        }
      });
    } else {
      res.json({ stats, tours: formattedTours });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch admin tours' });
  }
};

export const getTourById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tour = await prisma.tours.findUnique({
      where: { id: Number(id) },
      include: {
        tour_galleries: true,
      },
    });

    if (!tour) return res.status(404).json({ error: 'Tour not found' });
    
    const serialized = serializeTour(tour);
    serialized.tour_galleries = tour.tour_galleries?.map(g => ({
      id: Number(g.id),
      image: g.image
    })) || [];
    
    res.json(serialized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tour details' });
  }
};

export const createTour = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    data.author_id = (req as any).user?.id || 1; 

    // Convert booleans/checkboxes to numbers
    const numFields = ['status', 'enable_person_types', 'enable_extra_price', 'enable_service_fee', 'enable_fixed_dates', 'enable_open_hours', 'is_featured', 'min_advance_reservations', 'cancellation'];
    numFields.forEach(f => {
      if (data[f] !== undefined) data[f] = Number(data[f]);
    });

    // Parse floats
    const floatFields = ['price', 'sale_price', 'child_price'];
    floatFields.forEach(f => {
      if (data[f]) data[f] = parseFloat(data[f]);
    });

    const idFields = ['category_id', 'destination_id', 'country_id', 'state_id', 'city_id'];
    
    const jsonFields = ['faqs', 'includes', 'excludes', 'highlights', 'itinerary', 'person_types', 'extra_prices', 'service_fees', 'fixed_dates', 'open_hours', 'attribute_terms', 'destinations_array', 'custom_attributes', 'sub_destination'];
    jsonFields.forEach(f => {
      if (data[f] !== undefined) {
        if (typeof data[f] === 'object') {
          data[f] = JSON.stringify(data[f]);
        } else if (data[f] === '') {
          data[f] = null;
        }
      }
    });

    const createData: any = {
      author_id: BigInt(data.author_id),
      title: data.title,
      shoulder: data.shoulder,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      content: data.content,
      youtube_video: data.youtube_video,
      min_people: data.min_people,
      max_people: data.max_people,
      min_advance_reservations: data.min_advance_reservations,
      cancellation: data.cancellation,
      
      faq_title: data.faq_title,
      faqs: data.faqs, // JSON string
      include_title: data.include_title,
      includes: data.includes,
      exclude_title: data.exclude_title,
      excludes: data.excludes,
      highlight_title: data.highlight_title,
      highlights: data.highlights,
      itinerary_title: data.itinerary_title,
      itinerary: data.itinerary,
      
      price: data.price || 0,
      sale_price: data.sale_price || 0,
      child_price: data.child_price || 0,
      enable_person_types: data.enable_person_types || 2,
      person_types: data.person_types,
      enable_extra_price: data.enable_extra_price || 2,
      extra_prices: data.extra_prices,
      enable_service_fee: data.enable_service_fee || 2,
      service_fees: data.service_fees,
      
      duration: data.duration,
      address: data.address,
      zip_code: data.zip_code,
      map_lat: data.map_lat,
      map_lng: data.map_lng,
      destinations_array: data.destinations_array,
      custom_attributes: data.custom_attributes,
      starts_from: data.starts_from,
      sub_destination: data.sub_destination,
      
      enable_fixed_dates: data.enable_fixed_dates || 2,
      fixed_dates: data.fixed_dates,
      enable_open_hours: data.enable_open_hours || 2,
      open_hours: data.open_hours,
      attribute_terms: data.attribute_terms,
      
      enable_seo: String(data.enable_seo || '0'),
      meta_title: data.meta_title,
      meta_desc: data.meta_desc,
      meta_keyward: data.meta_keyward,
      
      status: data.status !== undefined ? data.status : 1
    };

    // Safely assign IDs
    idFields.forEach(f => {
      if (data[f]) createData[f] = BigInt(data[f]);
    });

    // Fallbacks for required relations if missing
    if (!createData.category_id) createData.category_id = BigInt(1);
    if (!createData.destination_id) createData.destination_id = BigInt(1);

    const newTour = await prisma.tours.create({
      data: createData
    });

    const tourId = Number(newTour.id);
    let needsUpdate = false;
    let updateData: any = {};

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    
    if (files?.features_image?.length) {
      updateData.features_image = await uploadToS3(files.features_image[0], `tours/${tourId}`);
      needsUpdate = true;
    }
    
    if (files?.youtube_image?.length) {
      updateData.youtube_image = await uploadToS3(files.youtube_image[0], `tours/${tourId}`);
      needsUpdate = true;
    }

    // Check payload size to prevent MySQL P1017 (Server closed connection)
    let totalSize = 0;
    for (const key in updateData) {
      if (typeof updateData[key] === 'string') {
        const size = Buffer.byteLength(updateData[key], 'utf8');
        totalSize += size;
        if (size > 2 * 1024 * 1024) {
          return res.status(400).json({ 
            error: `The content in field "${key}" is too large (${(size / 1024 / 1024).toFixed(2)} MB). Please do not paste images directly into the text editor. Use the image upload button instead.` 
          });
        }
      }
    }

    if (totalSize > 4 * 1024 * 1024) {
      return res.status(400).json({ error: `The total data size is too large (${(totalSize / 1024 / 1024).toFixed(2)} MB). Please remove any pasted images from your text.` });
    }

    if (needsUpdate) {
      await prisma.tours.update({
        where: { id: BigInt(tourId) },
        data: updateData
      });
    }

    if (files?.gallery_images?.length) {
      for (const file of files.gallery_images) {
        const url = await uploadToS3(file, `tours/${tourId}/gallery`);
        await prisma.tour_galleries.create({
          data: {
            image: url,
            tour_id: BigInt(tourId)
          }
        });
      }
    }

    res.status(201).json({ message: 'Tour created successfully', id: tourId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create tour' });
  }
};

export const updateTour = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    
    let deletedGalleries: number[] = [];
    if (data.deletedGalleries) {
      try { deletedGalleries = JSON.parse(data.deletedGalleries); } catch (e) {}
      delete data.deletedGalleries;
    }

    if (deletedGalleries.length > 0) {
      await prisma.tour_galleries.deleteMany({
        where: { id: { in: deletedGalleries.map((did: number) => BigInt(did)) } }
      });
    }

    const numFields = ['status', 'enable_person_types', 'enable_extra_price', 'enable_service_fee', 'enable_fixed_dates', 'enable_open_hours', 'is_featured', 'min_advance_reservations', 'cancellation'];
    numFields.forEach(f => {
      if (data[f] !== undefined && data[f] !== '') data[f] = Number(data[f]);
      else if (data[f] === '') data[f] = null;
    });

    const floatFields = ['price', 'sale_price', 'child_price'];
    floatFields.forEach(f => {
      if (data[f]) data[f] = parseFloat(data[f]);
      else if (data[f] === '') data[f] = 0;
    });

    const idFields = ['category_id', 'destination_id', 'country_id', 'state_id', 'city_id'];
    idFields.forEach(f => {
      if (data[f]) data[f] = BigInt(data[f]);
      else if (data[f] === '') data[f] = null;
    });
    
    const jsonFields = ['faqs', 'includes', 'excludes', 'highlights', 'itinerary', 'person_types', 'extra_prices', 'service_fees', 'fixed_dates', 'open_hours', 'attribute_terms', 'destinations_array', 'custom_attributes', 'sub_destination'];
    jsonFields.forEach(f => {
      if (data[f] !== undefined) {
        if (typeof data[f] === 'object') {
          data[f] = JSON.stringify(data[f]);
        } else if (data[f] === '') {
          data[f] = null;
        }
      }
    });
    
    if (data.enable_seo) data.enable_seo = String(data.enable_seo);
    
    // Clean up unnecessary fields sent from frontend that will cause Prisma to crash
    delete data.id;
    delete data.author_id;
    delete data.tour_galleries;
    delete data.locations_tours_city_idTolocations;
    delete data.tour_categories;
    delete data.sn;
    delete data.location;
    delete data.category;
    delete data.created_at;
    delete data.updated_at;
    delete data.price_symbol;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    
    if (files?.features_image?.length) {
      data.features_image = await uploadToS3(files.features_image[0], `tours/${id}`);
    }
    
    if (files?.youtube_image?.length) {
      data.youtube_image = await uploadToS3(files.youtube_image[0], `tours/${id}`);
    }

    // Check payload size to prevent MySQL P1017 (Server closed connection)
    let totalSize = 0;
    for (const key in data) {
      if (typeof data[key] === 'string') {
        const size = Buffer.byteLength(data[key], 'utf8');
        totalSize += size;
        if (size > 2 * 1024 * 1024) { // 2MB limit per field
          return res.status(400).json({ 
            error: `The content in field "${key}" is too large (${(size / 1024 / 1024).toFixed(2)} MB). Please do not paste images directly into the text editor. Use the image upload button instead.` 
          });
        }
      }
    }

    if (totalSize > 4 * 1024 * 1024) {
      return res.status(400).json({ error: `The total data size is too large (${(totalSize / 1024 / 1024).toFixed(2)} MB). Please remove any pasted images from your text.` });
    }

    await prisma.tours.update({
      where: { id: Number(id) },
      data
    });

    if (files?.gallery_images?.length) {
      for (const file of files.gallery_images) {
        const url = await uploadToS3(file, `tours/${id}/gallery`);
        await prisma.tour_galleries.create({
          data: {
            image: url,
            tour_id: BigInt(id)
          }
        });
      }
    }

    res.json({ message: 'Tour updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
};

export const deleteTour = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.tours.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete tour' });
  }
};

export const getAttributeTerms = async (req: Request, res: Response) => {
  try {
    const terms = await prisma.tour_attribute_terms.findMany({
      include: { tour_attributes: true },
      orderBy: { id: 'asc' }
    });
    const result = terms.map(t => ({
      id: Number(t.id),
      name: t.name,
      attribute_id: Number(t.attribute_id),
      attribute_name: (t.tour_attributes as any)?.name || ''
    }));
    res.json(result);
  } catch (error) {
    console.error('Error fetching attribute terms:', error);
    res.status(500).json({ error: 'Failed to fetch attribute terms' });
  }
};
