import { Request, Response } from 'express';
import prisma from '../prisma';

export const getThemeSettings = async (req: Request, res: Response) => {
  try {
    const setting = await prisma.settings.findUnique({
      where: { type: 'primary_color' }
    });
    res.json({ color: setting?.value || '#63AB45' });
  } catch (error) {
    console.error('Error fetching theme settings:', error);
    res.status(500).json({ message: 'Failed to fetch theme settings' });
  }
};

export const updateThemeSettings = async (req: Request, res: Response) => {
  try {
    const { color } = req.body;
    
    // Upsert the setting
    const setting = await prisma.settings.upsert({
      where: { type: 'primary_color' },
      update: { value: color },
      create: { type: 'primary_color', value: color }
    });
    
    res.json({ message: 'Theme color updated successfully', color: setting.value });
  } catch (error) {
    console.error('Error updating theme settings:', error);
    res.status(500).json({ message: 'Failed to update theme settings' });
  }
};
