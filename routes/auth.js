var express = require("express");
var router = express.Router();
let userController = require('../controllers/users');
let { RegisterValidator, validationResult, ChangPasswordValidator } = require('../utils/validatorHandler');
let { CheckLogin } = require('../utils/authHandler');
let jwt = require('jsonwebtoken');
let bcrypt = require('bcrypt');
let crypto = require('crypto');
let { sendMail } = require('../utils/mailHandler');
let roleModel = require('../schemas/roles'); // to assign default role easily if needed

router.post('/register', RegisterValidator, validationResult, async function (req, res, next) {
    try {
        let role = await roleModel.findOne({ name: "MEMBER" });
        if(!role) {
            // Default backward compatibility if role isn't created
            role = new roleModel({name: "MEMBER"});
            await role.save();
        }
        
        let newItem = await userController.CreateAnUser(
            req.body.username, req.body.password, req.body.email, role._id
        );
        res.status(201).send(newItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

router.post('/login', async function (req, res, next) {
    try {
        let { username, password } = req.body;
        let result = await userController.FindUserByUsername(username);
        if (!result) {
            return res.status(403).send("Sai thong tin dang nhap");
        }
        if (result.lockTime && result.lockTime > Date.now()) {
            return res.status(404).send("Ban dang bi khoa do dang nhap sai nhieu lan");
        }
        let isValid = await userController.CompareLogin(result, password);
        if (!isValid) {
            return res.status(403).send("Sai thong tin dang nhap");
        }
        
        let token = jwt.sign({ id: result._id }, 'secretKey', { expiresIn: '1d' });
        
        res.cookie("LOGIN_NNPTUD_S3", token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true
        });
        res.send({token: token, message: "Dang nhap thanh cong"});
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

router.get('/me', CheckLogin, function (req, res, next) {
    let user = req.user;
    res.send(user);
});

router.post('/logout', CheckLogin, function (req, res, next) {
    res.cookie("LOGIN_NNPTUD_S3", "", { maxAge: 0, httpOnly: true });
    res.send("Da logout");
});

router.post('/changepassword', CheckLogin, ChangPasswordValidator, validationResult, async function (req, res, next) {
    try {
        let { newpassword, oldpassword } = req.body;
        let user = req.user;
        if (bcrypt.compareSync(oldpassword, user.password)) {
            user.password = newpassword;
            await user.save();
            res.send("Doi mat khau thanh cong");
        } else {
            res.status(400).send("New/Old password khong dung");
        }
    } catch (error) {
        res.status(400).send("Loi doi pass");
    }
});

router.post('/forgotpassword', async function (req, res, next) {
    let { email } = req.body;
    let user = await userController.FindUserByEmail(email);
    if (user) {
        user.forgotPasswordToken = crypto.randomBytes(32).toString('hex');
        user.forgotPasswordTokenExp = Date.now() + 10 * 60 * 1000;
        let url = "http://localhost:3000/api/v1/auth/resetpassword/" + user.forgotPasswordToken;
        await user.save();
        await sendMail(user.email, url);
        res.send("Kiem tra email de reset pass");
    } else {
        res.status(404).send("Khong tim thay email");
    }
});

router.post('/resetpassword/:token', async function (req, res, next) {
    let { password } = req.body;
    let user = await userController.FindUserByToken(req.params.token);
    if (user) {
        user.password = password;
        user.forgotPasswordToken = null;
        user.forgotPasswordTokenExp = null;
        await user.save();
        res.send("Da cap nhat mat khau moi");
    } else {
        res.status(404).send("Token het han hoac khong hop le");
    }
});

module.exports = router;
