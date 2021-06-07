import { Router, Request, Response } from 'express';

import AuthController from '../controllers/AuthController';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to bookry APIs' });
});

router.use('/auth', AuthController);

export default router;
