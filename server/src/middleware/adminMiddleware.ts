import { Request, Response, NextFunction } from 'express';

export const adminProtect = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 3 || req.user.role === 4)) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as an admin' });
  }
};
