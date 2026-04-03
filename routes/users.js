var express = require("express");
var router = express.Router();
let { CreateUserValidator, validationResult } = require('../utils/validatorHandler');
let userModel = require("../schemas/users");
let userController = require('../controllers/users');
let { CheckLogin, CheckRole } = require('../utils/authHandler');

router.get("/", CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
  let users = await userModel.find({ isDeleted: false }).populate({ path: 'role', select: 'name' });
  res.send(users);
});

router.get("/:id", CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
  try {
    let result = await userModel.findOne({ _id: req.params.id, isDeleted: false }).populate('role');
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ message: "ID not found" });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post("/", CheckLogin, CheckRole("ADMIN"), CreateUserValidator, validationResult, async function (req, res, next) {
  try {
    let newItem = await userController.CreateAnUser(
      req.body.username, req.body.password, req.body.email, req.body.role
    );
    res.status(201).send(newItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.put("/:id", CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedItem) return res.status(404).send({ message: "ID not found" });
    
    let populated = await userModel.findById(updatedItem._id).populate('role');
    res.send(populated);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.delete("/:id", CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).send({ message: "ID not found" });
    }
    res.send({message: "Da xoa mem user"});
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = router;
