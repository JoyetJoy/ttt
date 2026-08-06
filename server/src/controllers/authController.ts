import { Request, Response } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.users.create({
      data: {
        username: name,
        fname: name,
        email,
        password: hashedPassword,
        phone,
        // Role defaults to 1 (Customer)
      },
    });

    // Generate token
    const token = jwt.sign({ id: Number(user.id), role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: {
        id: Number(user.id),
        name: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: Number(user.id), role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        id: Number(user.id),
        name: user.fname ? `${user.fname} ${user.lname || ''}` : user.username || user.email,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - req.user is populated by authMiddleware
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        fname: true,
        lname: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        created_at: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      ...user,
      id: Number(user.id),
      // Map it back to 'name' if the frontend expects it
      name: user.fname ? `${user.fname} ${user.lname || ''}` : user.username || user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const checkPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });

    const user = await prisma.users.findFirst({
      where: { phone },
    });

    res.json({ exists: !!user });
  } catch (error) {
    console.error('Error in checkPhone:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const loginPhone = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Phone and password are required' });

    const user = await prisma.users.findFirst({
      where: { phone },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: Number(user.id), role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: Number(user.id),
        name: user.fname ? `${user.fname} ${user.lname || ''}` : user.username || user.email,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in loginPhone:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

export const registerPhone = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    
    // Check if phone or email already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { phone },
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this phone or email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.users.create({
      data: {
        username: firstName,
        fname: firstName,
        lname: lastName || '',
        email: email || `${phone}@placeholder.com`, // fallback if no email provided
        password: hashedPassword,
        phone,
      },
    });

    const token = jwt.sign({ id: Number(user.id), role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: Number(user.id),
        name: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in registerPhone:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};
