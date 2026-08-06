import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDestinationAttributes = async (req: Request, res: Response) => {
  try {
    const attributes = await prisma.destination_attributes.findMany({
      include: {
        destination_attribute_terms: true
      }
    });
    
    const transformed = attributes.map(attr => ({
      ...attr,
      id: Number(attr.id),
      destination_attribute_terms: attr.destination_attribute_terms.map(t => ({
        ...t,
        id: Number(t.id),
        attribute_id: Number(t.attribute_id)
      }))
    }));
    
    res.json(transformed);
  } catch (error) {
    console.error('Error fetching destination attributes:', error);
    res.status(500).json({ error: 'Failed to fetch attributes' });
  }
};

export const createDestinationAttribute = async (req: Request, res: Response) => {
  try {
    const { name, terms } = req.body;
    
    const attribute = await prisma.destination_attributes.create({
      data: {
        name,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
        destination_attribute_terms: {
          create: terms.map((termName: string) => ({
            name: termName,
            status: 1,
            created_at: new Date(),
            updated_at: new Date()
          }))
        }
      },
      include: { destination_attribute_terms: true }
    });

    res.status(201).json({
      ...attribute,
      id: Number(attribute.id),
      destination_attribute_terms: attribute.destination_attribute_terms.map(t => ({
        ...t,
        id: Number(t.id),
        attribute_id: Number(t.attribute_id)
      }))
    });
  } catch (error) {
    console.error('Error creating destination attribute:', error);
    res.status(500).json({ error: 'Failed to create attribute' });
  }
};

export const updateDestinationAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, terms } = req.body;

    await prisma.destination_attribute_terms.deleteMany({
      where: { attribute_id: BigInt(id) }
    });

    const attribute = await prisma.destination_attributes.update({
      where: { id: BigInt(id) },
      data: {
        name,
        updated_at: new Date(),
        destination_attribute_terms: {
          create: terms.map((termName: string) => ({
            name: termName,
            status: 1,
            created_at: new Date(),
            updated_at: new Date()
          }))
        }
      },
      include: { destination_attribute_terms: true }
    });

    res.json({
      ...attribute,
      id: Number(attribute.id),
      destination_attribute_terms: attribute.destination_attribute_terms.map(t => ({
        ...t,
        id: Number(t.id),
        attribute_id: Number(t.attribute_id)
      }))
    });
  } catch (error) {
    console.error('Error updating destination attribute:', error);
    res.status(500).json({ error: 'Failed to update attribute' });
  }
};

export const deleteDestinationAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.destination_attributes.delete({
      where: { id: BigInt(id) }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting destination attribute:', error);
    res.status(500).json({ error: 'Failed to delete attribute' });
  }
};
