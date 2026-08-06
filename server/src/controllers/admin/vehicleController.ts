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

// Get all vehicle types
export const getVehicleTypes = async (req: Request, res: Response) => {
  try {
    const types = await prisma.vehicle_types.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(serializeBigInt(types));
  } catch (error) {
    console.error('Error fetching vehicle types:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle types' });
  }
};

// Create a new vehicle type
export const createVehicleType = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const type = await prisma.vehicle_types.create({
      data: { name }
    });
    res.status(201).json(serializeBigInt(type));
  } catch (error) {
    console.error('Error creating vehicle type:', error);
    res.status(500).json({ error: 'Failed to create vehicle type' });
  }
};

// Get all vehicles
export const getVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicles.findMany({
      include: {
        vehicle_types: true
      },
      orderBy: { id: 'desc' }
    });
    res.json(serializeBigInt(vehicles));
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};

// Create a new vehicle
export const createVehicle = async (req: Request, res: Response) => {
  try {
    const { name, type_id } = req.body;
    if (!name || !type_id) {
      return res.status(400).json({ error: 'Name and Type ID are required' });
    }

    const vehicle = await prisma.vehicles.create({
      data: {
        name,
        type_id: BigInt(type_id)
      },
      include: {
        vehicle_types: true
      }
    });

    res.status(201).json(serializeBigInt(vehicle));
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
};

export const updateVehicleType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const type = await prisma.vehicle_types.update({
      where: { id: BigInt(id) },
      data: { name }
    });
    res.json(serializeBigInt(type));
  } catch (error) {
    console.error('Error updating vehicle type:', error);
    res.status(500).json({ error: 'Failed to update vehicle type' });
  }
};

export const deleteVehicleType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.vehicle_types.delete({
      where: { id: BigInt(id) }
    });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle type:', error);
    res.status(500).json({ error: 'Failed to delete vehicle type' });
  }
};
