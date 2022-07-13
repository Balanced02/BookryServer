import { Request, Response, NextFunction } from 'express';

const socialMediaChecks = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { socialMedia } = req.body;
  if (Array.isArray(socialMedia)) {
    if (socialMedia.find((value) => typeof value === 'object')) {
      next();
    } else {
      return res
        .status(401)
        .json({ message: 'Object not found' });
    }
  } else {
    return res
      .status(401)
      .json({ message: 'Cannot perform this operation on a non Array' });
  }
  return null;
};
export default socialMediaChecks;
