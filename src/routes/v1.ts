import { Router, Request, Response } from 'express';

import AuthController from '../controllers/AuthController';
import BookController from '../controllers/BooksController';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'api_greeting' });
});

router.use('/auth', AuthController);
router.use('/books', BookController);

export default router;
