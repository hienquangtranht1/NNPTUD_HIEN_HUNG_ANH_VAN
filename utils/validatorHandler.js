const { body, validationResult: expressResult } = require('express-validator');

let RegisterValidator = [
  body('username').notEmpty().withMessage('Username bắt buộc').isLength({ min: 3 }).withMessage('Tối thiểu 3 ký tự'),
  body('email').notEmpty().withMessage('Email bắt buộc').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Password bắt buộc').isLength({ min: 6 }).withMessage('Tối thiểu 6 ký tự'),
  body('role').notEmpty().withMessage('Role ID bắt buộc'),
];

let CreateUserValidator = [
  body('username').notEmpty().withMessage('Username bắt buộc'),
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Password tối thiểu 6 ký tự'),
  body('role').notEmpty().withMessage('Role ID bắt buộc'),
];

let ChangPasswordValidator = [
  body('oldpassword').notEmpty().withMessage('Mật khẩu cũ bắt buộc'),
  body('newpassword')
    .notEmpty().withMessage('Mật khẩu mới bắt buộc')
    .isLength({ min: 6 }).withMessage('Tối thiểu 6 ký tự')
    .matches(/[A-Z]/).withMessage('Phải có ít nhất 1 chữ hoa')
    .matches(/[0-9]/).withMessage('Phải có ít nhất 1 chữ số'),
];

let validationResult = function (req, res, next) {
  let errors = expressResult(req);
  if (!errors.isEmpty()) return res.status(400).send({ errors: errors.array() });
  next();
};

module.exports = { RegisterValidator, CreateUserValidator, ChangPasswordValidator, validationResult };
