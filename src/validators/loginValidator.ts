import { check } from 'express-validator';

const emailValidator = check('email')
  .isEmail()
  .withMessage('Please provide a valid email address');

const passwordValidator = check('password')
  .isLength({ min: 8 })
  .withMessage('Password must be a minimum of 8 characters');

export default { emailValidator, passwordValidator };
