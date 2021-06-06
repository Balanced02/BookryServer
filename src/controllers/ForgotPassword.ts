/* eslint-disable no-underscore-dangle */
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/UserModel';
import formatValidationMessages from '../helpers/formatValidationMessages';
import loginValidator from '../validators/loginValidator';
import mailingService from '../mailing/service';
import confirmEmailTemplate from '../mailing/confirmEmail';

declare module 'express-session' {
  interface Session {
    resetCode?: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
const router: Router = Router();

router.post(
  '/recoverPassword',
  loginValidator[0],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(formatValidationMessages(errors.array()));
      }
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'Invalid email address!' });
      }

      const resetCode = Math.floor(Math.random() * 100000);

      req.session.resetCode = resetCode;

      mailingService(
        'Password Reset Code',
        confirmEmailTemplate(resetCode),
        email,
      );

      await user.save();

      return res
        .status(200)
        .json({ message: 'Password reset code has been sent ' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  },
);

router.post('/verifyCode', (req: Request, res: Response) => {
  if (
    req.session.resetCode && Number(req.body.resetCode) === Number(req.session.resetCode)
  ) {
    res.status(200).json({ message: 'Verified sucessfully' });
  } else {
    res.status(400).json({ message: 'Wrong reset code provided' });
  }
});

router.post(
  '/resetPassword/:code',
  loginValidator,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(formatValidationMessages(errors.array()));
      }
      const { email, password } = req.body;

      if (Number(req.params.code) !== Number(req.session.resetCode)) {
        return res
          .status(400)
          .json({ message: 'The code you enter is invalid' });
      }

      delete req.session.resetCode;

      const user = await User.findOne({ email });

      const salt: string = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      user.password = '';

      const payload = {
        id: user._id,
        email: user.email,
        userType: user.userType,
      };

      return res.status(200).json({
        token: jwt.sign(payload, process.env.jwtSecret, {
          expiresIn: 15768000,
        }),
        user,
        message: user.isEmailVerified
          ? `Welcome ${user.fullName}`
          : `${user.fullName}, Please verify your account `,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  },
);

export default router;
