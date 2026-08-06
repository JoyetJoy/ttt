import { Request, Response } from 'express';
import prisma from '../prisma';

export const getTourAttributes = async (req: Request, res: Response) => {
  try {
    const attributes = await prisma.tour_attributes.findMany({
      include: {
        tour_attribute_terms: true
      },
      orderBy: { id: 'desc' }
    });
    
    const serialized = attributes.map((attr: any) => ({
      ...attr,
      id: Number(attr.id),
      tour_attribute_terms: attr.tour_attribute_terms.map((term: any) => ({
        ...term,
        id: Number(term.id),
        attribute_id: Number(term.attribute_id)
      }))
    }));
    
    res.json(serialized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tour attributes' });
  }
};

export const createTourAttribute = async (req: Request, res: Response) => {
  try {
    const { name, terms } = req.body;
    
    const newAttribute = await prisma.tour_attributes.create({
      data: {
        name,
        tour_attribute_terms: {
          create: terms.map((t: string) => ({ name: t }))
        }
      },
      include: {
        tour_attribute_terms: true
      }
    });
    
    res.status(201).json({
      ...newAttribute,
      id: Number(newAttribute.id),
      tour_attribute_terms: newAttribute.tour_attribute_terms.map((t: any) => ({
        ...t, id: Number(t.id), attribute_id: Number(t.attribute_id)
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create tour attribute' });
  }
};

export const updateTourAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, terms } = req.body;
    
    // First update the name
    await prisma.tour_attributes.update({
      where: { id: Number(id) },
      data: { name }
    });
    
    // Manage terms: delete existing, create new ones
    await prisma.tour_attribute_terms.deleteMany({
      where: { attribute_id: Number(id) }
    });
    
    if (terms && terms.length > 0) {
      await prisma.tour_attribute_terms.createMany({
        data: terms.map((t: string) => ({ name: t, attribute_id: Number(id) }))
      });
    }

    const updated = await prisma.tour_attributes.findUnique({
      where: { id: Number(id) },
      include: { tour_attribute_terms: true }
    });

    res.json({
      ...updated,
      id: Number(updated?.id),
      tour_attribute_terms: updated?.tour_attribute_terms.map((t: any) => ({
        ...t, id: Number(t.id), attribute_id: Number(t.attribute_id)
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update tour attribute' });
  }
};

export const deleteTourAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.tour_attributes.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Attribute deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete tour attribute' });
  }
};
