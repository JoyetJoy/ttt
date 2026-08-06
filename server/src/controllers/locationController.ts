import { Request, Response } from 'express';
import prisma from '../prisma';

// Helper to convert BigInts to Numbers
const serializeLocation = (loc: any) => ({
  ...loc,
  id: Number(loc.id),
  state_id: loc.state_id ? Number(loc.state_id) : null,
  country_id: loc.country_id ? Number(loc.country_id) : null,
});

export const getCountries = async (req: Request, res: Response) => {
  try {
    const countries = await prisma.locations.findMany({
      where: {
        country_id: null,
        state_id: null,
      },
      orderBy: { name: 'asc' }
    });
    res.json(countries.map(serializeLocation));
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
};

export const getStates = async (req: Request, res: Response) => {
  try {
    const { countryId } = req.params;
    const states = await prisma.locations.findMany({
      where: {
        country_id: Number(countryId),
        state_id: null,
      },
      orderBy: { name: 'asc' }
    });
    res.json(states.map(serializeLocation));
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
};

export const getCities = async (req: Request, res: Response) => {
  try {
    const { stateId } = req.params;
    const cities = await prisma.locations.findMany({
      where: {
        state_id: Number(stateId),
      },
      orderBy: { name: 'asc' }
    });
    res.json(cities.map(serializeLocation));
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
};

export const createLocation = async (req: Request, res: Response) => {
  try {
    const { name, country_id, state_id } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newLocation = await prisma.locations.create({
      data: {
        name,
        country_id: country_id ? Number(country_id) : null,
        state_id: state_id ? Number(state_id) : null,
      }
    });

    res.status(201).json(serializeLocation(newLocation));
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: 'Name is required' });

    const updated = await prisma.locations.update({
      where: { id: Number(id) },
      data: { name }
    });

    res.json(serializeLocation(updated));
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.locations.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Location deleted' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ error: 'Failed to delete location. It might be in use.' });
  }
};
