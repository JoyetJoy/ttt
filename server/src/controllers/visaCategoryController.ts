import { Request, Response } from 'express';
import prisma from '../prisma';

export const getVisaCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.visa_categories.findMany();
    // Serialize bigints to numbers
    const serialized = categories.map(c => ({
      ...c,
      id: Number(c.id)
    }));
    res.json(serialized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch visa categories' });
  }
};

export const createVisaCategory = async (req: Request, res: Response) => {
  try {
    const { name, status } = req.body;
    const newCategory = await prisma.visa_categories.create({
      data: {
        name,
        status: status ? parseInt(status) : 1
      }
    });
    res.status(201).json({
      ...newCategory,
      id: Number(newCategory.id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create visa category' });
  }
};

export const updateVisaCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    const updatedCategory = await prisma.visa_categories.update({
      where: { id: BigInt(id) },
      data: {
        name,
        status: status !== undefined ? parseInt(status) : undefined
      }
    });
    res.json({
      ...updatedCategory,
      id: Number(updatedCategory.id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update visa category' });
  }
};

export const deleteVisaCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.visa_categories.delete({
      where: { id: BigInt(id) }
    });
    res.json({ message: 'Visa category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete visa category' });
  }
};
