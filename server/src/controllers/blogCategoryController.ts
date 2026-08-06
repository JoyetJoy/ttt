import { Request, Response } from 'express';
import prisma from '../prisma';

const serializeCategory = (category: any) => ({
  ...category,
  id: Number(category.id),
});

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.blog_categories.findMany({
      orderBy: { id: 'desc' }
    });
    res.json(categories.map(serializeCategory));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch blog categories' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    // Generate simple slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newCategory = await prisma.blog_categories.create({
      data: {
        name,
        slug,
        status: 1
      }
    });

    res.status(201).json(serializeCategory(newCategory));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create blog category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.blog_categories.delete({
      where: { id: BigInt(id) }
    });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete blog category' });
  }
};
