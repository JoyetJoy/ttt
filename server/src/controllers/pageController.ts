import { Request, Response } from 'express';
import prisma from '../prisma';

const serializePage = (page: any) => ({
  ...page,
  id: Number(page.id),
});

export const getAdminPages = async (req: Request, res: Response) => {
  try {
    const total_pages = await prisma.pages.count();
    const total_active_pages = await prisma.pages.count({ where: { status: 1 } });

    const stats = {
      total_pages,
      total_active_pages
    };

    const pages = await prisma.pages.findMany({
      orderBy: { id: 'desc' }
    });

    const formattedPages = pages.map((p, index) => ({
      ...serializePage(p),
      sn: index + 1
    }));

    res.json({ stats, pages: formattedPages });
  } catch (error) {
    console.error('Error fetching admin pages:', error);
    res.status(500).json({ error: 'Failed to fetch admin pages' });
  }
};

export const getActivePages = async (req: Request, res: Response) => {
  try {
    const pages = await prisma.pages.findMany({
      where: { status: 1 },
      orderBy: { id: 'asc' },
      select: { id: true, page_name: true, page_slug: true }
    });
    res.json(pages.map(p => ({ ...p, id: Number(p.id) })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
};

export const getPageBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const page = await prisma.pages.findFirst({
      where: { page_slug: slug, status: 1 }
    });

    if (!page) return res.status(404).json({ error: 'Page not found' });

    const widget_contents = await prisma.widget_contents.findMany({
      where: { page_id: Number(page.id), status: 1 },
      orderBy: { position: 'asc' }
    });

    const formattedWidgets = widget_contents.map(w => ({
      ...w,
      id: Number(w.id),
      page_id: Number(w.page_id)
    }));

    res.json({ ...serializePage(page), widget_contents: formattedWidgets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
};

export const getPageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = await prisma.pages.findUnique({
      where: { id: Number(id) }
    });

    if (!page) return res.status(404).json({ error: 'Page not found' });
    
    // Fetch widget contents manually since relation might not be defined
    const widget_contents = await prisma.widget_contents.findMany({
      where: { page_id: Number(id) },
      orderBy: { position: 'asc' }
    });
    
    const formattedWidgets = widget_contents.map(w => ({
      ...w,
      id: Number(w.id),
      page_id: Number(w.page_id)
    }));

    const pageData = serializePage(page);
    pageData.widget_contents = formattedWidgets;

    res.json(pageData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch page details' });
  }
};

export const createPage = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };

    if (data.enable_seo) data.enable_seo = String(data.enable_seo);
    if (data.status !== undefined) data.status = Number(data.status);
    if (data.is_bread_crumb !== undefined) data.is_bread_crumb = Number(data.is_bread_crumb);

    const newPage = await prisma.pages.create({
      data: {
        page_name: data.page_name,
        page_slug: data.page_slug || (data.page_name ? data.page_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : null),
        meta_title: data.meta_title,
        meta_keyward: data.meta_keyward,
        meta_description: data.meta_description,
        widget_name: data.widget_name,
        widget_content_code: data.widget_content_code,
        status: data.status !== undefined ? data.status : 1,
        enable_seo: data.enable_seo,
        is_bread_crumb: data.is_bread_crumb !== undefined ? data.is_bread_crumb : 1
      }
    });

    res.status(201).json({ message: 'Page created successfully', id: Number(newPage.id) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create page' });
  }
};

export const updatePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    const widgets = data.widgets; // Array of widgets to save
    delete data.widgets;
    delete data.widget_contents;
    
    if (data.enable_seo !== undefined) data.enable_seo = String(data.enable_seo);
    if (data.status !== undefined) data.status = Number(data.status);
    if (data.is_bread_crumb !== undefined) data.is_bread_crumb = Number(data.is_bread_crumb);

    await prisma.pages.update({
      where: { id: Number(id) },
      data
    });

    // Handle widget contents
    if (Array.isArray(widgets)) {
      // Delete existing widgets for this page
      await prisma.widget_contents.deleteMany({
        where: { page_id: Number(id) }
      });
      
      // Create new ones
      if (widgets.length > 0) {
        const widgetData = widgets.map((w, index) => ({
          page_id: Number(id),
          widget_slug: w.widget_slug,
          ui_card_number: w.ui_card_number || null,
          widget_content: w.widget_content || null,
          position: index,
          status: w.status !== undefined ? Number(w.status) : 1
        }));
        
        await prisma.widget_contents.createMany({
          data: widgetData
        });
      }
    }

    res.json({ message: 'Page updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update page' });
  }
};

export const deletePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.pages.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
};
