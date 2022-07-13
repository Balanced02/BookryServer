import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/UserModel';

const emailNotVerified = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.headers.authorization;
  try {
    if (token && typeof token === 'string') {
      const verifiedToken: any = jwt.verify(
        token.split(' ')[1],
        process.env.jwtSecret,
      );
      if (verifiedToken) {
        const user = await User.findById(verifiedToken.id);
        req.user = user;
        if (!user.isEmailVerified) {
          next();
        } else {
          res.status(200).json({
            message: 'verified',
          });
        }
      } else {
        res.status(401).json({
          message: 'access_failed',
        });
      }
    } else {
      res.status(401).json({
        message: 'token_invalid',
      });
    }
  } catch (error) {
    res.status(401).json({
      message: 'access_failed',
    });
  }
};

export default emailNotVerified;
