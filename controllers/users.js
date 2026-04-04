let userModel = require('../schemas/users');
let bcrypt = require('bcrypt');

module.exports = {
  CreateAnUser: async function (username, password, email, role, session, fullName, avatarUrl) {
    let newUser = new userModel({ username, password, email, role, fullName: fullName || '', avatarUrl: avatarUrl || '' });
    await newUser.save({ session });
    return newUser;
  },
  FindUserByUsername: async function (username) {
    return await userModel.findOne({ isDeleted: false, username });
  },
  FindUserByEmail: async function (email) {
    return await userModel.findOne({ isDeleted: false, email });
  },
  FindUserByToken: async function (token) {
    let result = await userModel.findOne({ isDeleted: false, forgotPasswordToken: token });
    if (result && result.forgotPasswordTokenExp > Date.now()) return result;
    return false;
  },
  CompareLogin: async function (user, password) {
    if (bcrypt.compareSync(password, user.password)) {
      user.loginCount = 0;
      await user.save();
      return user;
    }
    user.loginCount++;
    if (user.loginCount >= 3) {
      user.lockTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      user.loginCount = 0;
    }
    await user.save();
    return false;
  },
  GetUserById: async function (id) {
    try {
      return await userModel.findOne({ _id: id, isDeleted: false }).populate('role');
    } catch (e) { return false; }
  }
};
