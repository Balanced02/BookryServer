/* eslint-disable no-underscore-dangle */
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Profile from '../models/ProfileModel';
import User from '../models/UserModel';
import formatValidationMessages from '../helpers/formatValidationMessages';
import mailingService from '../mailing/service';
import confirmEmailTemplate from '../mailing/confirmEmail';
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
        user.password = '';
        return res
          .status(200)
          .json({ message: 'Email Verified Successfully!', user });
      }
      return res.status(400).json({ message: 'Please provide a correct code' });
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
  try {
    if (
      req.session.resetCode
      && Number(req.body.resetCode) === Number(req.session.resetCode)
    ) {
      res.status(200).json({ message: 'Verified sucessfully' });
    } else {
      res.status(400).json({ message: 'Wrong reset code provided' });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Something went wrong! please try again later',
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
      if (findUser.comparePassword(oldPassword)) {
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
        user.password = '';
        return res
          .status(200)
          .json({ message: 'Password changed succesfully', user });
      }
      return res
        .status(400)
        .json({ message: 'Enter a valid password and try again.' });
    } catch (error) {
      return res
        .status(500)
        .json({
          message:
            'Something went wrong trying to change your password please try again later',
          error,
        });
    }
  },
);

router.put('/updateProfile', validateToken, async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          fullName: req.body.fullName,
        },
      },
      {
        new: true,
      },
    );
    user.password = '';
    const hasprofile = await Profile.findOne({ userId: req.user._id });
    if (!hasprofile) {
      const { phoneNumber, dateOfBirth, socialMedia } = req.body;
      const profile = new Profile({
        phoneNumber,
        dateOfBirth,
        socialMedia,
        userId: req.user._id,
      });
      await profile.save();
      return res
        .status(200)
        .json({ message: 'Profile updated successfully', profile, user });
    }
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          phoneNumber: req.body.phoneNumber,
          dateOfBirth: req.body.dateOfBirth,
          socialMedia: req.body.socialMedia,
        },
      },
    );
    return res
      .status(200)
      .json({ message: 'Profile updated successfully', profile, user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Something went wrong please try again later', error });
  }
});

export default router;
