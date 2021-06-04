import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/UserModel';

const authWithEmailVerified = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.headers.authorization;
  if (token && typeof token === 'string') {
    const verifiedToken: any = jwt.verify(
      token.split(' ')[1],
      process.env.jwtSecret,
    );
    if (verifiedToken) {
      const user = await User.findById(verifiedToken.id);
      req.user = user;
      if (user.isEmailVerified) {
        next();
      } else {
        res.status(401).json({
          message: 'Please verify your email address',
        });
      }
    } else {
      res.status(401).json({
        message: 'Unauthorized access',
      });
    }
  } else {
    res.status(401).json({
      message: 'Unauthorized access',
    });
  }
};

export default { authWithEmailVerified };
