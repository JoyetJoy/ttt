import { Request, Response } from 'express';
import prisma from '../prisma';

export const getTourCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.tour_categories.findMany({
      orderBy: { name: 'asc' },
    });
    
    const formatted = categories.map(c => ({
      ...c,
      id: Number(c.id)
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching tour categories:', error);
    res.status(500).json({ error: 'Failed to fetch tour categories' });
  }
};

export const createTourCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newCategory = await prisma.tour_categories.create({
      data: {
        name,
        slug,
        status: 1
      }
    });

    res.status(201).json({
      ...newCategory,
      id: Number(newCategory.id)
    });
  } catch (error) {
    console.error('Error creating tour category:', error);
    res.status(500).json({ error: 'Failed to create tour category' });
  }
};

export const updateTourCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const updated = await prisma.tour_categories.update({
      where: { id: Number(id) },
      data: { name, slug }
    });

    res.json({
      ...updated,
      id: Number(updated.id)
    });
  } catch (error) {
    console.error('Error updating tour category:', error);
    res.status(500).json({ error: 'Failed to update tour category' });
  }
};

export const deleteTourCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.tour_categories.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Tour category deleted successfully' });
  } catch (error) {
    console.error('Error deleting tour category:', error);
    res.status(500).json({ error: 'Failed to delete tour category' });
  }
};
