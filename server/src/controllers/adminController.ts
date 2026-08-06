import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAdminDashboardStats = async (req: Request, res: Response) => {
  try {
    const total_customers = await prisma.users.count({ where: { role: 1 } });
    const total_agents = await prisma.users.count({ where: { role: 2 } });
    
    const total_destinations = await prisma.destinations.count();
    const total_tours = await prisma.tours.count();
    const total_bookings = await prisma.orders.count();
    
    const active_destinations = await prisma.destinations.count({ where: { status: 1 } });
    const active_tours = await prisma.tours.count({ where: { status: 1 } });
    const total_active = active_destinations + active_tours;

    const totalAmountAgg = await prisma.wallets.aggregate({
      where: { status: 2, type: 2 },
      _sum: { amount: true }
    });
    const total_amount = totalAmountAgg._sum.amount || 0;

    const totalDepositAgg = await prisma.wallets.aggregate({
      where: { type: 1, status: 2 },
      _sum: { total_amount: true }
    });
    const total_deposit = totalDepositAgg._sum.total_amount || 0;

    const totalWithdrawAgg = await prisma.wallets.aggregate({
      where: { type: 4, status: 2 },
      _sum: { amount: true }
    });
    const total_withdraw = totalWithdrawAgg._sum.amount || 0;

    const recentOrders = await prisma.orders.findMany({
      orderBy: { created_at: 'desc' },
      take: 12,
      include: {
        users_orders_user_idTousers: { select: { fname: true, lname: true, email: true, phone: true } }
      }
    });

    // Formatting orders to match frontend expectation cleanly
    const formattedOrders = recentOrders.map(order => ({
      id: Number(order.id),
      order_number: order.order_number,
      first_name: order.users_orders_user_idTousers?.fname || order.first_name,
      last_name: order.users_orders_user_idTousers?.lname || order.last_name,
      email: order.users_orders_user_idTousers?.email || order.email,
      phone: order.users_orders_user_idTousers?.phone || order.phone,
      product_type: order.product_type,
      transport_type: order.transport_type,
      qty: order.adult_qty + order.child_qty,
      total_with_tax: order.total_with_tax || order.total_amount,
      createdAt: order.created_at
    }));

    res.json({
      stats: {
        total_amount,
        total_customers,
        total_agents,
        total_deposit,
        total_withdraw,
        total_destinations,
        total_tours,
        total_bookings,
        total_active
      },
      recentOrders: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getAdminCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.users.findMany({
      where: { role: 1 },
      orderBy: { created_at: 'desc' }
    });
    
    // Convert BigInts before sending to client
    const serializeBigInt = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;
      if (typeof obj === 'bigint') return obj.toString();
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

    res.json(serializeBigInt(customers));
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};
