let userModel = require('../schemas/users');
let bcrypt = require('bcrypt');

const CreateAnUser = async (username, password, email, roleId) => {
    let checkUser = await userModel.findOne({ username: username });
    if(checkUser) {
        throw new Error("Username da ton tai");
    }
    let newUser = new userModel({
        username: username,
        password: password,
        email: email,
        role: roleId
    });
    await newUser.save();
    return newUser;
};

const FindUserByUsername = async (username) => {
    return await userModel.findOne({ username: username, isDeleted: false });
};

const CompareLogin = async (user, password) => {
    let result = bcrypt.compareSync(password, user.password);
    if (!result) {
        user.loginCount += 1;
        if (user.loginCount >= 5) {
            user.lockTime = Date.now() + 15 * 60 * 1000; // Khoa 15 phut
            user.loginCount = 0;
        }
        await user.save();
        return false;
    } else {
        user.loginCount = 0;
        await user.save();
        return true;
    }
};

const FindUserByEmail = async (email) => {
    return await userModel.findOne({ email: email, isDeleted: false });
};

const FindUserByToken = async (token) => {
    return await userModel.findOne({
        forgotPasswordToken: token,
        forgotPasswordTokenExp: { $gt: Date.now() },
        isDeleted: false
    });
};

module.exports = {
    CreateAnUser,
    FindUserByUsername,
    CompareLogin,
    FindUserByEmail,
    FindUserByToken
};
