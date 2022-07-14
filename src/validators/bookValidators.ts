import { check } from 'express-validator';

const createBookValidator = check('title')
  .isLength({ min: 4 })
  .withMessage('invalid_title_length')
  .notEmpty()
  .withMessage('no_title');

export default { createBookValidator };
