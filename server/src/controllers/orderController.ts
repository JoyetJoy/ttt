import { Request, Response } from 'express';
import prisma from '../prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

// Helper to generate random order number
const generateOrderNumber = () => {
  return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    let userId = 1; // Fallback user ID to 1 (Admin/Guest)
    
    // Check if token exists in headers and decode it
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded && decoded.id) {
          userId = decoded.id;
        }
      } catch (err) {
        console.error('Invalid token during checkout, falling back to guest');
      }
    }
    
    // We assume merchant_id is 1 for now (admin), or we could fetch the tour's author_id.
    const merchantId = data.merchant_id || 1;

    const newOrder = await prisma.orders.create({
      data: {
        user_id: BigInt(userId),
        merchant_id: BigInt(merchantId),
        order_number: generateOrderNumber(),
        product_id: String(data.product_id),
        product_type: data.product_type || 'tour',
        start_date: data.start_date,
        end_date: data.end_date,
        days: data.days,
        adult_unit_price: parseFloat(data.adult_unit_price) || 0,
        adult_qty: parseInt(data.adult_qty) || 0,
        adult_total_price: parseFloat(data.adult_total_price) || 0,
        child_unit_price: parseFloat(data.child_unit_price) || 0,
        child_qty: parseInt(data.child_qty) || 0,
        child_total_price: parseFloat(data.child_total_price) || 0,
        services: data.services ? JSON.stringify(data.services) : null,
        total_amount: parseFloat(data.total_amount) || 0,
        total_with_tax: parseFloat(data.total_amount) || 0, // Simplified tax
        first_name: data.first_name || 'Guest',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        notes: data.notes || '',
        status: 1, // 1 = Pending/Confirmed
        payment_status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    res.status(201).json({ 
      message: 'Booking confirmed successfully', 
      order_id: Number(newOrder.id),
      order_number: newOrder.order_number 
    });
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
};

export const getAdminOrders = async (req: Request, res: Response) => {
  try {
    const ordersData = await prisma.orders.findMany({
      orderBy: { id: 'desc' }
    });

    // We also want to fetch the product name (Tour name). 
    // Since product_id is a string, we might need to fetch the tours separately or map them.
    // For simplicity, we'll fetch all tours and map them in memory.
    const tours = await prisma.tours.findMany({
      select: { id: true, title: true }
    });
    const tourMap = new Map(tours.map(t => [String(t.id), t.title]));

    const formattedOrders = ordersData.map((o, idx) => ({
      sn: idx + 1,
      id: Number(o.id),
      order_number: o.order_number,
      customer_name: `${o.first_name} ${o.last_name}`.trim(),
      customer_email: o.email,
      customer_phone: o.phone,
      product_name: tourMap.get(o.product_id) || `Product #${o.product_id}`,
      product_type: o.product_type,
      start_date: o.start_date,
      total_amount: o.total_amount,
      status: o.status
    }));

    res.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Failed to fetch admin orders:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const getAdminOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.orders.findUnique({
      where: { id: BigInt(id) }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    let productName = `Product #${order.product_id}`;
    if (order.product_type === 'tour') {
      const tour = await prisma.tours.findUnique({ where: { id: BigInt(order.product_id) }, select: { title: true } });
      if (tour) productName = tour.title;
    } else if (order.product_type === 'hotel') {
      const hotel = await prisma.hotels.findUnique({ where: { id: BigInt(order.product_id) }, select: { title: true } });
      if (hotel) productName = hotel.title;
    }

    const formattedOrder = {
      ...order,
      id: Number(order.id),
      user_id: Number(order.user_id),
      merchant_id: Number(order.merchant_id),
      view: Number(order.view),
      product_name: productName
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error('Failed to fetch order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
};

export const updateAdminOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const dataToUpdate: any = {};
    if (status !== undefined) dataToUpdate.status = Number(status);
    if (payment_status !== undefined) dataToUpdate.payment_status = Number(payment_status);

    const updatedOrder = await prisma.orders.update({
      where: { id: BigInt(id) },
      data: dataToUpdate
    });

    const formattedOrder = {
      ...updatedOrder,
      id: Number(updatedOrder.id),
      user_id: Number(updatedOrder.user_id),
      merchant_id: Number(updatedOrder.merchant_id),
      view: Number(updatedOrder.view)
    };

    res.json({ message: 'Order updated successfully', order: formattedOrder });
  } catch (error) {
    console.error('Failed to update order:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};
