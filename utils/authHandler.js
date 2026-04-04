let jwt = require('jsonwebtoken');
let userController = require('../controllers/users');

const SECRET_KEY = 'secretKey_QLTASK';

// CheckLogin: xác thực JWT Token — đặt trước route cần bảo vệ
let CheckLogin = async function (req, res, next) {
  try {
    let token = null;
    let authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (!token) token = req.cookies['LOGIN_QLTASK'];
    if (!token) return res.status(401).send({ message: 'Chưa đăng nhập. Vui lòng cung cấp token.' });

    let decoded = jwt.verify(token, SECRET_KEY);
    let user = await userController.GetUserById(decoded.id);
    if (!user) return res.status(401).send({ message: 'Tài khoản không tồn tại.' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).send({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
};

// CheckRole: phân quyền — dùng: CheckRole("ADMIN") hoặc CheckRole("ADMIN","MANAGER")
let CheckRole = function (...roles) {
  return function (req, res, next) {
    let userRole = req.user && req.user.role && req.user.role.name;
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).send({ message: `Không đủ quyền. Yêu cầu: ${roles.join(' hoặc ')}` });
    }
    next();
  };
};

module.exports = { CheckLogin, CheckRole };
