const jwt = require("jsonwebtoken");
const userModel = require("../schemas/users");

const CheckLogin = async (req, res, next) => {
  try {
    let token = req.cookies.LOGIN_NNPTUD_S3;
    if (!token) {
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      }
    }
    
    if (!token) {
      return res.status(403).send("User chua dang nhap");
    }

    let decoded = jwt.verify(token, 'secretKey');
    let user = await userModel.findById(decoded.id).populate('role');
    
    if (!user || user.isDeleted) {
      return res.status(403).send("User khong ton tai hoac da bi xoa");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).send("Token khong hop le");
  }
};

const CheckRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).send("Khong co quen truy cap");
    }
    
    if (roles.includes(req.user.role.name)) {
      next();
    } else {
      res.status(403).send("Ban khong du quyen (Role khong khop)");
    }
  };
};

module.exports = { CheckLogin, CheckRole };
