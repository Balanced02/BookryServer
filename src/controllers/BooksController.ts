import { Router, Request, Response } from 'express';
import authWithEmailVerified from '../middlewares/authWithEmailVerified';
import Book from '../models/BookModel'

const router: Router = Router();

router.post('/create-book', authWithEmailVerified, async (req: Request, res: Response) => {
  const { title, coverImage } = req.body
  try {
    const book = await Book.create({ title, coverImage, user: req.user._id })
    return res.status(200).json({ data: book, message: 'success' })
  } catch (error) {
    return res.status(500).json({ message: 'server_error', error })
  }
})

router.get('/trending', async (req: Request, res: Response) => {
  try {
    const count: number = await Book.find().countDocuments()
    const random: number = Math.floor(Math.random() * count)
    const data = await Book.find().skip(random).limit(20)
    return res.status(200).json({ data, message: 'success' })
  } catch (error) {
    return res.status(500).json({ message: 'server_error', error })
  }
})

export default router;
