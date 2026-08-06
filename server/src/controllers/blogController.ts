import { Request, Response } from 'express';
import prisma from '../prisma';
import { uploadToS3 } from '../utils/s3Upload';

const serialize = (obj: any) => JSON.parse(JSON.stringify(obj, (key, value) =>
  typeof value === 'bigint' ? Number(value) : value
));

export const getBlogs = async (req: Request, res: Response) => {
  try {
    const blogsData = await prisma.blogs.findMany({
      where: { status: 1 },
      orderBy: { id: 'desc' },
      include: {
        blog_categories: true,
        users: {
          select: { fname: true, lname: true }
        }
      }
    });

    res.json({ blogs: serialize(blogsData) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

export const getAdminBlogs = async (req: Request, res: Response) => {
  try {
    const blogsData = await prisma.blogs.findMany({
      orderBy: { id: 'desc' },
      include: {
        blog_categories: true,
        users: {
          select: { fname: true, lname: true }
        }
      }
    });

    res.json(serialize(blogsData));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch admin blogs' });
  }
};

export const getBlogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const blog = await prisma.blogs.findUnique({
      where: { id: BigInt(id) },
      include: {
        blog_categories: true,
      }
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json(serialize(blog));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch blog details' });
  }
};

export const createBlog = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    data.user_id = BigInt(req.user.id);
    
    if (data.category_id) data.category_id = BigInt(data.category_id);
    if (data.status !== undefined && data.status !== '') data.status = Number(data.status);
    if (data.enable_seo) data.enable_seo = String(data.enable_seo);

    // Filter out undefined or irrelevant fields before creating
    const createData = {
      title: data.title,
      slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description: data.description,
      tags: data.tags,
      enable_seo: data.enable_seo,
      meta_title: data.meta_title,
      meta_keyward: data.meta_keyward,
      meta_description: data.meta_description,
      status: data.status !== undefined ? data.status : 1,
      user_id: data.user_id,
      category_id: data.category_id,
    };

    const newBlog = await prisma.blogs.create({ data: createData });
    const blogId = newBlog.id;

    // Handle file upload
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files?.image?.[0]) {
      const url = await uploadToS3(files.image[0], `blogs/${blogId}/feature`);
      await prisma.blogs.update({
        where: { id: blogId },
        data: { image: url }
      });
      newBlog.image = url;
    }

    res.status(201).json(serialize(newBlog));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create blog' });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    if (data.category_id) data.category_id = BigInt(data.category_id);
    if (data.status !== undefined && data.status !== '') data.status = Number(data.status);
    if (data.enable_seo) data.enable_seo = String(data.enable_seo);

    const updateData = {
      title: data.title,
      slug: data.title ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : undefined,
      description: data.description,
      tags: data.tags,
      enable_seo: data.enable_seo,
      meta_title: data.meta_title,
      meta_keyward: data.meta_keyward,
      meta_description: data.meta_description,
      status: data.status,
      category_id: data.category_id,
      image: undefined as string | undefined
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if ((updateData as any)[key] === undefined) {
        delete (updateData as any)[key];
      }
    });

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files?.image?.[0]) {
      updateData.image = await uploadToS3(files.image[0], `blogs/${id}/feature`);
    }

    const updatedBlog = await prisma.blogs.update({
      where: { id: BigInt(id) },
      data: updateData
    });

    res.json(serialize(updatedBlog));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update blog' });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.blogs.delete({
      where: { id: BigInt(id) }
    });
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
};
