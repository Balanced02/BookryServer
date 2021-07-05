import { check } from 'express-validator';

const emailValidator = check('email')
  .isEmail()
  .withMessage('Please provide a valid Email address');

const fullNameValidator = check('fullName')
  .notEmpty()
  .withMessage('Please provide Full Name');

const passwordValidator = check('password')
  .isLength({ min: 8 })
  .withMessage('Password must be a minimum of 8 characters')
  .matches(/\d/)
  .withMessage('Password must contain a number')
  .not()
  .isIn(['123456', 'password', 'god'])
  .withMessage('Password to easy to guess, use something stronger ');

const socialMediaValidator = check('facebook')
  .notEmpty()
  .withMessage('Please provide a valid link to your profile');

export default { passwordValidator, emailValidator, fullNameValidator };
