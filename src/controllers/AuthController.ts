import { Router, Request, Response } from 'express';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  res.json({ message: 'login route' });
});

router.post('/register', (req: Request, res: Response) => {
  res.json({ message: 'registration route' });
});

export default router;
