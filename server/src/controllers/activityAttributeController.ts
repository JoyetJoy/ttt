import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAttributes = async (req: Request, res: Response) => {
  try {
    const attributes = await prisma.activities_attributes.findMany({
      include: {
        activities_attribute_terms: true
      },
      orderBy: { id: 'desc' }
    });
    
    const serialized = attributes.map((attr: any) => ({
      ...attr,
      id: Number(attr.id),
      activities_attribute_terms: attr.activities_attribute_terms.map((term: any) => ({
        ...term,
        id: Number(term.id),
        attribute_id: Number(term.attribute_id)
      }))
    }));
    
    res.json(serialized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch attributes' });
  }
};

export const createAttribute = async (req: Request, res: Response) => {
  try {
    const { name, terms } = req.body;
    
    const newAttribute = await prisma.activities_attributes.create({
      data: {
        name,
        activities_attribute_terms: {
          create: terms.map((t: string) => ({ name: t }))
        }
      },
      include: {
        activities_attribute_terms: true
      }
    });
    
    res.status(201).json({
      ...newAttribute,
      id: Number(newAttribute.id),
      activities_attribute_terms: newAttribute.activities_attribute_terms.map((t: any) => ({
        ...t, id: Number(t.id), attribute_id: Number(t.attribute_id)
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create attribute' });
  }
};

export const updateAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, terms } = req.body;
    
    // First update the name
    await prisma.activities_attributes.update({
      where: { id: Number(id) },
      data: { name }
    });
    
    // Manage terms: delete existing, create new ones
    await prisma.activities_attribute_terms.deleteMany({
      where: { attribute_id: Number(id) }
    });
    
    if (terms && terms.length > 0) {
      await prisma.activities_attribute_terms.createMany({
        data: terms.map((t: string) => ({ name: t, attribute_id: Number(id) }))
      });
    }

    const updated = await prisma.activities_attributes.findUnique({
      where: { id: Number(id) },
      include: { activities_attribute_terms: true }
    });

    res.json({
      ...updated,
      id: Number(updated?.id),
      activities_attribute_terms: updated?.activities_attribute_terms.map((t: any) => ({
        ...t, id: Number(t.id), attribute_id: Number(t.attribute_id)
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update attribute' });
  }
};

export const deleteAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.activities_attributes.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Attribute deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete attribute' });
  }
};
