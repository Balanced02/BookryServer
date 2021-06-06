import { Router, Request, Response } from 'express';

import AuthController from '../controllers/AuthController';
import ForgotPassword from '../controllers/ForgotPassword';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to bookry APIs' });
});

router.use('/auth', AuthController);
router.use('/forgotPassword', ForgotPassword);

export default router;
