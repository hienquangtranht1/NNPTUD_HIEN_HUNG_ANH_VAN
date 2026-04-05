// routes/auth.js — HIỂN phụ trách
var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
let { RegisterValidator, validationResult, ChangPasswordValidator } = require('../utils/validatorHandler');
let { CheckLogin } = require('../utils/authHandler');
let jwt = require('jsonwebtoken');
let bcrypt = require('bcrypt');
let crypto = require('crypto');
let { sendMail } = require('../utils/mailHandler');
let fs = require('fs');
let path = require('path');

// RS256: Dùng Private Key để Sign Token (nằm ở thư mục root)
const privateKey = fs.readFileSync(path.join(__dirname, '../private.pem'), 'utf8');

// POST /api/v1/auth/register
router.post('/register', RegisterValidator, validationResult, async function (req, res, next) {
  try {
    let newItem = await userController.CreateAnUser(
      req.body.username, req.body.password, req.body.email, 
      req.body.role, null, req.body.fullName, null, req.body.department
    );
    res.send(newItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// POST /api/v1/auth/login
router.post('/login', async function (req, res, next) {
  try {
    let { username, password } = req.body;
    let result = await userController.FindUserByUsername(username);
    if (!result) return res.status(403).send({ message: 'Sai thông tin đăng nhập' });
    if (result.lockTime && result.lockTime > Date.now())
      return res.status(403).send({ message: 'Tài khoản bị khoá 24h do nhập sai quá nhiều lần' });
    result = await userController.CompareLogin(result, password);
    if (!result) return res.status(403).send({ message: 'Sai thông tin đăng nhập' });

    // Cấp Token RS256
    let token = jwt.sign({ id: result._id }, privateKey, { algorithm: 'RS256', expiresIn: '1d' });
    res.cookie('LOGIN_QLTASK', token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
    res.send({ token });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// GET /api/v1/auth/me
router.get('/me', CheckLogin, function (req, res, next) {
  res.send(req.user);
});

// POST /api/v1/auth/logout
router.post('/logout', CheckLogin, function (req, res, next) {
  res.cookie('LOGIN_QLTASK', '', { maxAge: 0, httpOnly: true });
  res.send({ message: 'Đăng xuất thành công' });
});

// POST /api/v1/auth/changepassword
router.post('/changepassword', CheckLogin, ChangPasswordValidator, validationResult, async function (req, res, next) {
  let { oldpassword, newpassword } = req.body;
  let user = req.user;
  if (bcrypt.compareSync(oldpassword, user.password)) {
    user.password = newpassword;
    await user.save();
    return res.send({ message: 'Đổi mật khẩu thành công' });
  }
  res.status(400).send({ message: 'Mật khẩu cũ không đúng' });
});

// POST /api/v1/auth/forgotpassword
router.post('/forgotpassword', async function (req, res, next) {
  let { email } = req.body;
  let user = await userController.FindUserByEmail(email);
  if (user) {
    user.forgotPasswordToken = crypto.randomBytes(32).toString('hex');
    user.forgotPasswordTokenExp = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendMail(user.email, `http://localhost:3000/api/v1/auth/resetpassword/${user.forgotPasswordToken}`);
  }
  res.send({ message: 'Kiểm tra email của bạn' });
});

// POST /api/v1/auth/resetpassword/:token
router.post('/resetpassword/:token', async function (req, res, next) {
  let user = await userController.FindUserByToken(req.params.token);
  if (user) {
    user.password = req.body.password;
    user.forgotPasswordToken = null;
    user.forgotPasswordTokenExp = null;
    await user.save();
    return res.send({ message: 'Đặt lại mật khẩu thành công' });
  }
  res.status(400).send({ message: 'Token không hợp lệ hoặc hết hạn' });
});

module.exports = router;
