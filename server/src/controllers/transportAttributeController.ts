import { Request, Response } from 'express';
import prisma from '../prisma';

export const getTransportAttributes = async (req: Request, res: Response) => {
  try {
    const attributes = await prisma.transport_attributes.findMany({
      include: {
        transport_attribute_terms: true
      },
      orderBy: { id: 'desc' }
    });
    
    const serialized = attributes.map((attr: any) => ({
      ...attr,
      id: Number(attr.id),
      transport_attribute_terms: attr.transport_attribute_terms.map((term: any) => ({
        ...term,
        id: Number(term.id),
        attribute_id: Number(term.attribute_id)
      }))
    }));
    
    res.json(serialized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch transport attributes' });
  }
};

export const createTransportAttribute = async (req: Request, res: Response) => {
  try {
    const { name, terms } = req.body;
    
    const newAttribute = await prisma.transport_attributes.create({
      data: {
        name,
        transport_attribute_terms: {
          create: terms.map((t: string) => ({ name: t }))
        }
      },
      include: {
        transport_attribute_terms: true
      }
    });
    
    res.status(201).json({
      ...newAttribute,
      id: Number(newAttribute.id),
      transport_attribute_terms: newAttribute.transport_attribute_terms.map((t: any) => ({
        ...t, id: Number(t.id), attribute_id: Number(t.attribute_id)
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create transport attribute' });
  }
};

export const updateTransportAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, terms } = req.body;
    
    // First update the name
    await prisma.transport_attributes.update({
      where: { id: Number(id) },
      data: { name }
    });
    
    // Manage terms: delete existing, create new ones
    await prisma.transport_attribute_terms.deleteMany({
      where: { attribute_id: Number(id) }
    });
    
    if (terms && terms.length > 0) {
      await prisma.transport_attribute_terms.createMany({
        data: terms.map((t: string) => ({ name: t, attribute_id: Number(id) }))
      });
    }

    const updated = await prisma.transport_attributes.findUnique({
      where: { id: Number(id) },
      include: { transport_attribute_terms: true }
    });

    res.json({
      ...updated,
      id: Number(updated?.id),
      transport_attribute_terms: updated?.transport_attribute_terms.map((t: any) => ({
        ...t, id: Number(t.id), attribute_id: Number(t.attribute_id)
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update transport attribute' });
  }
};

export const deleteTransportAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.transport_attributes.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Attribute deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete transport attribute' });
  }
};
