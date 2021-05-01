import {Router, Request, Response, NextFunction} from 'express'

const router = Router()

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
    res.json({message: 'login route'});
});

router.post("/register", (req: Request, res: Response, next: NextFunction) => {
    res.json({message: 'registration route'});
});

export default router