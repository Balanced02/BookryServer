import { Router, Request, Response } from 'express';
import authWithEmailVerified from '../middlewares/authWithEmailVerified';
import Book from '../models/BookModel';
import Chapter from '../models/ChaptersModel';

const router: Router = Router();

router.post('/create-book', authWithEmailVerified, async (req: Request, res: Response) => {
  const { title, coverImage } = req.body;
  try {
    const book = await Book.create({ title, coverImage, user: req.user._id });
    return res.status(200).json({ data: book, message: 'success' });
  } catch (error) {
    return res.status(500).json({ message: 'server_error', error });
  }
});

router.post('/update-chapter-order/:id', authWithEmailVerified, async (req: Request, res: Response) => {
  const { chapters } = req.body;
  const { id } = req.params;
  try {
    const data = await Book.findByIdAndUpdate(id, {
      $set: {
        chapters,
      },
    },
    {
      new: true,
    });
    return res.status(200).json({ data, message: 'success' });
  } catch (error) {
    return res.status(500).json({ message: 'server_error', error });
  }
});

router.post('/create-chapter/:bookId', authWithEmailVerified, async (req: Request, res: Response) => {
  try {
    const { title, description, body } = req.body;
    const { bookId } = req.params;
    const book = await Book.findById(bookId);
    if (book) {
      const data = await Chapter.create({
        title,
        description,
        body,
      });
      await Book.findByIdAndUpdate(bookId, {
        $set: {
          $push: { chapters: data._id },
        },
      },
      {
        new: true,
      });
      return res.status(200).json({ message: 'success', data });
    }
    return res.status(400).json({ message: 'bad_request' });
  } catch (error) {
    return res.status(500).json({ message: 'server_error', error });
  }
});

router.post('/update-chapter/:id', authWithEmailVerified, async (req: Request, res: Response) => {
  try {
    const { title, description, body } = req.body;
    const { id } = req.params;
    const data = await Chapter.findByIdAndUpdate(id, {
      $set: {
        title,
        description,
        body,
      },
    },
    {
      new: true,
    });
    return res.status(200).json({ message: 'success', data });
  } catch (error) {
    return res.status(500).json({ message: 'server_error', error });
  }
});

router.get('/trending', async (req: Request, res: Response) => {
  try {
    const count: number = await Book.find().countDocuments();
    const random: number = Math.floor(Math.random() * count);
    const data = await Book.find().skip(random).limit(20);
    return res.status(200).json({ data, message: 'success' });
  } catch (error) {
    return res.status(500).json({ message: 'server_error', error });
  }
});

export default router;
