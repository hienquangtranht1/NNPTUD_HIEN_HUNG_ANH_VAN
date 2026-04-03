const { check, validationResult: rawValidationResult } = require('express-validator');

const RegisterValidator = [
  check('username').notEmpty().withMessage('Username is required'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  check('email').isEmail().withMessage('Invalid email format')
];

const ChangPasswordValidator = [
  check('oldpassword').notEmpty().withMessage('Old password is required'),
  check('newpassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];

const CreateUserValidator = [
  check('username').notEmpty().withMessage('Username is required'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  check('email').isEmail().withMessage('Invalid email format'),
  check('role').notEmpty().withMessage('Role is required')
];

const validationResult = (req, res, next) => {
  const errors = rawValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  next();
};

module.exports = {
  RegisterValidator,
  ChangPasswordValidator,
  CreateUserValidator,
  validationResult
};
