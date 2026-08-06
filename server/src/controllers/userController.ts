import { Request, Response } from 'express';
import prisma from '../prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // Get counts for different types of bookings
    const totalTours = await prisma.orders.count({ where: { user_id: userId, product_type: 'tour' } });
    const totalHotels = await prisma.orders.count({ where: { user_id: userId, product_type: 'hotel' } });
    const totalTransports = await prisma.orders.count({ where: { user_id: userId, product_type: 'transport' } });
    
    // Get recent bookings
    const recentBookings = await prisma.orders.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 5
    });

    const formattedBookings = recentBookings.map(b => ({
      ...b,
      id: Number(b.id),
      user_id: Number(b.user_id),
      merchant_id: Number(b.merchant_id),
      view: Number(b.view)
    }));

    res.json({
      stats: {
        tours: totalTours,
        hotels: totalHotels,
        transports: totalTransports
      },
      recentBookings: formattedBookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body; 
    
    const fname = name ? name.split(' ')[0] : undefined;
    const lname = name ? name.split(' ').slice(1).join(' ') : undefined;

    const user = await prisma.users.update({
      where: { id: userId },
      data: { 
        fname: fname,
        lname: lname,
        username: name,
        phone: phone 
      },
      select: {
        id: true,
        username: true,
        fname: true,
        lname: true,
        email: true,
        phone: true,
        role: true,
        status: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const bookings = await prisma.orders.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });

    const formattedBookings = bookings.map(b => ({
      ...b,
      id: Number(b.id),
      user_id: Number(b.user_id),
      merchant_id: Number(b.merchant_id),
      view: Number(b.view)
    }));

    res.json(formattedBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const booking = await prisma.orders.findFirst({
      where: { 
        id: BigInt(id),
        user_id: userId // Ensure user owns this booking
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    let productName = `Product #${booking.product_id}`;
    let productImage = '';
    if (booking.product_type === 'tour') {
      const tour = await prisma.tours.findUnique({ where: { id: BigInt(booking.product_id) }, select: { title: true, features_image: true } });
      if (tour) {
        productName = tour.title;
        productImage = tour.features_image || '';
      }
    } else if (booking.product_type === 'hotel') {
      const hotel = await prisma.hotels.findUnique({ where: { id: BigInt(booking.product_id) }, select: { title: true, feature_img: true } });
      if (hotel) {
        productName = hotel.title;
        productImage = hotel.feature_img || '';
      }
    } else if (booking.product_type === 'transport') {
      const transport = await prisma.transports.findUnique({ where: { id: BigInt(booking.product_id) }, select: { title: true, feature_img: true } });
      if (transport) {
        productName = transport.title;
        productImage = transport.feature_img || '';
      }
    } else if (booking.product_type === 'activity') {
      const activity = await prisma.activities.findUnique({ where: { id: BigInt(booking.product_id) }, select: { title: true, feature_img: true } });
      if (activity) {
        productName = activity.title;
        productImage = activity.feature_img || '';
      }
    }

    const formattedBooking = {
      ...booking,
      id: Number(booking.id),
      user_id: Number(booking.user_id),
      merchant_id: Number(booking.merchant_id),
      view: Number(booking.view),
      product_name: productName,
      product_image: productImage
    };

    res.json(formattedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch booking details' });
  }
};
