import { check } from 'express-validator';

const emailValidator = check('email')
  .isEmail()
  .withMessage('email_invalid');

const fullNameValidator = check('fullName')
  .notEmpty()
  .withMessage('full_name_empty');

const passwordValidator = check('password')
  .isLength({ min: 8 })
  .withMessage('password_length')
  .matches(/\d/)
  .withMessage('password_with_number')
  .not()
  .isIn(['123456', 'password', 'god'])
  .withMessage('password_easy ');

export default { passwordValidator, emailValidator, fullNameValidator };
