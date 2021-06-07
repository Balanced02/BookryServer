/* eslint-disable no-underscore-dangle */
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/UserModel';
import formatValidationMessages from '../helpers/formatValidationMessages';
import registerValidator from '../validators/registerValidator';
import loginValidator from '../validators/loginValidator';
import mailingService from '../mailing/service';
import confirmEmailTemplate from '../mailing/confirmEmail';
import emailNotVerified from '../middlewares/emailNotVerified';

declare module 'express-session' {
  interface Session {
    verificationCode: number;
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
  '/register',
  registerValidator,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(formatValidationMessages(errors.array()));
      }
      const { email, password, fullName } = req.body;
      const isUserCreated = await User.findOne({ email });
      if (isUserCreated) {
        return res
          .status(409)
          .json({ message: 'A user with that email address already exists' });
      }

      const user = new User({ fullName, email });

      const salt: string = await bcrypt.genSalt(10);

      user.password = bcrypt.hashSync(password, salt);

      await user.save();

      const verificationCode = Math.floor(Math.random() * 100000);

      req.session.verificationCode = verificationCode;

      mailingService(
        'Confirm Email',
        confirmEmailTemplate(verificationCode),
        email,
      );

      user.password = '';

      const payload = {
        id: user._id,
        email: user.email,
        userType: user.userType,
      };

      const token = jwt.sign(payload, process.env.jwtSecret);

      return res
        .status(200)
        .json({ message: 'New user created successfully ', token, user });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  },
);

router.post('/login', loginValidator, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatValidationMessages(errors.array()));
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.comparePassword(password)) {
      return res.status(401).json({
        message: 'Authentication failed, invalid Email or Password.',
      });
    }

    user.password = '';

    const payload = {
      id: user._id,
      email: user.email,
      userType: user.userType,
    };

    return res.status(200).json({
      token: jwt.sign(payload, process.env.jwtSecret, { expiresIn: 15768000 }),
      user,
      message: user.isEmailVerified
        ? `Welcome ${user.fullName}`
        : `${user.fullName}, Please verify your account `,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
});

router.post(
  '/verifyEmail',
  emailNotVerified,
  async (req: Request, res: Response) => {
    try {
      if (
        req.session.verificationCode && Number(req.body.verificationCode)
        === Number(req.session.verificationCode)
      ) {
        const user = await User.findByIdAndUpdate(
          req.user._id,
          {
            $set: {
              isEmailVerified: true,
            },
          },
          {
            new: true,
          },
        );
        user.password = '';
        return res.status(200).json({ message: 'Email Verified Successfully!', user });
      }
    } catch (error) {
      return res
        .status(400)
        .json({ message: 'Wrong code provided', error });
    }
    return res
      .status(400)
      .json({ message: 'Please provide a correct code' });
  },
);

router.get('/resendCode', emailNotVerified, async (req: Request, res: Response) => {
  try {
    const { email } = req.user;
    const verificationCode = Math.floor(Math.random() * 100000);
    req.session.verificationCode = verificationCode;
    mailingService(
      'Confirm Email',
      confirmEmailTemplate(verificationCode),
      email,
    );
    return res
      .status(200)
      .json({ message: 'Verification code sent succesfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
