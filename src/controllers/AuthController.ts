/* eslint-disable no-underscore-dangle */
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/UserModel';
import formatValidationMessages from '../helpers/formatValidationMessages';
// import mailingService from '../mailing/service';
// import confirmEmailTemplate from '../mailing/confirmEmail';
import emailNotVerified from '../middlewares/emailNotVerified';
import validators from '../validators/validators';
import validateToken from '../middlewares/validateToken';

declare module 'express-session' {
  interface Session {
    verificationCode: number;
    resetCode?: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      user: {
        _id: string;
        fullName: string;
        email: string;
        password: string;
        isEmailVerified: boolean;
        userType: 'author' | 'editor' | 'reader';
      };
    }
  }
}

const router: Router = Router();

router.post(
  '/admin/register',
  [
    validators.emailValidator,
    validators.passwordValidator,
    validators.fullNameValidator,
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(formatValidationMessages(errors.array()));
      }
      const { email, password, fullName } = req.body;
      const isUserCreated = await User.findOne({ email, userType: 'super-admin' });
      if (isUserCreated) {
        return res
          .status(409)
          .json({ message: 'A user with that email address already exists' });
      }

      const user = new User({ fullName, email });

      const salt: string = await bcrypt.genSalt(10);

      user.password = bcrypt.hashSync(password, salt);

      const verificationCode = Math.floor(Math.random() * 100000);

      req.session.verificationCode = verificationCode;

      await user.save();

      console.log('verificationCode', verificationCode);

      // mailingService(
      //   'Confirm Email',
      //   confirmEmailTemplate(verificationCode),
      //   email,
      // );

      const payload = {
        id: user._id,
        role: user.role,
        email: user.email,
        userType: user.userType,
      };

      const token = jwt.sign(payload, process.env.jwtSecret);

      return res
        .status(200)
        .json({ message: 'New user created successfully ', token, data: { fullName: user.fullName, email: user.email } });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  },
);

router.post(
  '/register',
  [
    validators.emailValidator,
    validators.passwordValidator,
    validators.fullNameValidator,
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(formatValidationMessages(errors.array()));
      }
      const { email, password, fullName } = req.body;
      const isUserCreated = await User.findOne({ email });
      if (isUserCreated) {
        return res.status(409).json({ message: 'email_exist' });
      }

      const user = new User({ fullName, email });

      const salt: string = await bcrypt.genSalt(10);

      user.password = bcrypt.hashSync(password, salt);

      await user.save();

      const verificationCode = Math.floor(Math.random() * 100000);

      req.session.verificationCode = verificationCode;
      console.log('verificationCode', verificationCode);

      // mailingService(
      //   'Confirm Email',
      //   confirmEmailTemplate(verificationCode),
      //   email,
      // );

      user.password = '';

      const payload = {
        id: user._id,
        email: user.email,
        userType: user.userType,
      };

      const token = jwt.sign(payload, process.env.jwtSecret);

      return res.status(200).json({
        message: 'user_create_success ',
        data: user,
        token,
      });
    } catch (error) {
      return res.status(500).json({ message: 'server_error', error });
    }
  },
);

router.post(
  '/login',
  [validators.emailValidator],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(formatValidationMessages(errors.array()));
      }
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !user.comparePassword(password)) {
        return res.status(401).json({
          message: 'invalid_credentials',
        });
      }

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
        data: user,
        message: user.isEmailVerified ? 'greet_user' : 'verify_account',
      });
    } catch (error) {
      return res.status(500).json({ message: 'server_error', error });
    }
  },
);

router.post(
  '/verifyEmail',
  emailNotVerified,
  async (req: Request, res: Response) => {
    try {
      if (
        req.session.verificationCode
        && Number(req.body.verificationCode)
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
        if (!user) {
          return res.status(400).json({ message: 'user_not_found' });
        }
        user.password = '';
        return res.status(200).json({ message: 'email_verified', data: user });
      }
      return res.status(400).json({ message: 'token_invalid' });
    } catch (error) {
      return res.status(500).json({
        message: 'Something went wrong! please try again later',
        error,
      });
    }
  },
);

router.post(
  '/recoverPassword',
  [validators.emailValidator],
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
      console.log('resetCode', resetCode);

      // mailingService(
      //   'Password Reset Code',
      //   confirmEmailTemplate(resetCode),
      //   email,
      // );

      await user.save();

      return res.status(200).json({ message: 'reset_token_sent' });
    } catch (error) {
      return res.status(500).json({ message: 'server_error', error });
    }
  },
);

router.post('/verifyCode', (req: Request, res: Response) => {
  try {
    if (
      req.session.resetCode
      && Number(req.body.resetCode) === Number(req.session.resetCode)
    ) {
      res.status(200).json({ message: 'verified' });
    } else {
      res.status(400).json({ message: 'token_invalid' });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'server_error',
      error,
    });
  }
});

router.post(
  '/changePassword',
  validateToken,
  [validators.passwordValidator],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(formatValidationMessages(errors.array()));
      }
      const { oldPassword, password } = req.body;
      const findUser = await User.findById(req.user._id);
      if (findUser && findUser.comparePassword(oldPassword)) {
        const salt: string = await bcrypt.genSalt(10);
        const user = await User.findByIdAndUpdate(
          req.user._id,
          {
            $set: {
              password: bcrypt.hashSync(password, salt),
            },
          },
          {
            new: true,
          },
        );
        if (!user) {
          return res.status(400).json({ message: 'user_not_found' });
        }
        user.password = '';
        return res
          .status(200)
          .json({ message: 'password_reset_success', user });
      }
      return res.status(400).json({ message: 'password_invalid' });
    } catch (error) {
      return res.status(500).json({
        message: 'server_error',
        error,
      });
    }
  },
);

export default router;
