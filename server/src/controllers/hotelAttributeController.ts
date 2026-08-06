import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getHotelAttributes = async (req: Request, res: Response) => {
  try {
    const attributes = await prisma.hotel_attributes.findMany({
      include: {
        hotel_attribute_terms: true
      }
    });
    
    const transformed = attributes.map(attr => ({
      ...attr,
      id: Number(attr.id),
      hotel_attribute_terms: attr.hotel_attribute_terms.map(t => ({
        ...t,
        id: Number(t.id),
        attribute_id: Number(t.attribute_id)
      }))
    }));
    
    res.json(transformed);
  } catch (error) {
    console.error('Error fetching hotel attributes:', error);
    res.status(500).json({ error: 'Failed to fetch attributes' });
  }
};

export const createHotelAttribute = async (req: Request, res: Response) => {
  try {
    const { name, terms } = req.body;
    
    const attribute = await prisma.hotel_attributes.create({
      data: {
        name,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
        hotel_attribute_terms: {
          create: terms.map((termName: string) => ({
            name: termName,
            status: 1,
            created_at: new Date(),
            updated_at: new Date()
          }))
        }
      },
      include: { hotel_attribute_terms: true }
    });

    res.status(201).json({
      ...attribute,
      id: Number(attribute.id),
      hotel_attribute_terms: attribute.hotel_attribute_terms.map(t => ({
        ...t,
        id: Number(t.id),
        attribute_id: Number(t.attribute_id)
      }))
    });
  } catch (error) {
    console.error('Error creating hotel attribute:', error);
    res.status(500).json({ error: 'Failed to create attribute' });
  }
};

export const updateHotelAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, terms } = req.body;

    await prisma.hotel_attribute_terms.deleteMany({
      where: { attribute_id: BigInt(id) }
    });

    const attribute = await prisma.hotel_attributes.update({
      where: { id: BigInt(id) },
      data: {
        name,
        updated_at: new Date(),
        hotel_attribute_terms: {
          create: terms.map((termName: string) => ({
            name: termName,
            status: 1,
            created_at: new Date(),
            updated_at: new Date()
          }))
        }
      },
      include: { hotel_attribute_terms: true }
    });

    res.json({
      ...attribute,
      id: Number(attribute.id),
      hotel_attribute_terms: attribute.hotel_attribute_terms.map(t => ({
        ...t,
        id: Number(t.id),
        attribute_id: Number(t.attribute_id)
      }))
    });
  } catch (error) {
    console.error('Error updating hotel attribute:', error);
    res.status(500).json({ error: 'Failed to update attribute' });
  }
};

export const deleteHotelAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.hotel_attributes.delete({
      where: { id: BigInt(id) }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting hotel attribute:', error);
    res.status(500).json({ error: 'Failed to delete attribute' });
  }
};
