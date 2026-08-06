import { Request, Response } from 'express';
import prisma from '../../prisma';

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

// Get all transport locations
export const getTransportLocations = async (req: Request, res: Response) => {
  try {
    const locations = await prisma.transport_locations.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(serializeBigInt(locations));
  } catch (error) {
    console.error('Error fetching transport locations:', error);
    res.status(500).json({ error: 'Failed to fetch transport locations' });
  }
};

// Create a new transport location
export const createTransportLocation = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const location = await prisma.transport_locations.create({
      data: { name }
    });
    res.status(201).json(serializeBigInt(location));
  } catch (error) {
    console.error('Error creating transport location:', error);
    res.status(500).json({ error: 'Failed to create transport location' });
  }
};

// Update a transport location
export const updateTransportLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const location = await prisma.transport_locations.update({
      where: { id: BigInt(id) },
      data: { name }
    });
    res.json(serializeBigInt(location));
  } catch (error) {
    console.error('Error updating transport location:', error);
    res.status(500).json({ error: 'Failed to update transport location' });
  }
};

// Delete a transport location
export const deleteTransportLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.transport_locations.delete({
      where: { id: BigInt(id) }
    });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting transport location:', error);
    res.status(500).json({ error: 'Failed to delete transport location' });
  }
};
