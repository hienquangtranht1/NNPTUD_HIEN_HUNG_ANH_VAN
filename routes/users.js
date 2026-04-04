// routes/users.js — HIỂN phụ trách
// TODO: Viết CRUD users tại đây
var express = require('express');
var router = express.Router();
let { CreateUserValidator, validationResult } = require('../utils/validatorHandler');
let userModel = require('../schemas/users');
let userController = require('../controllers/users');
let { CheckLogin, CheckRole } = require('../utils/authHandler');

// GET /api/v1/users — Danh sách (chỉ ADMIN, MANAGER)
router.get('/', CheckLogin, CheckRole('ADMIN', 'MANAGER'), async function (req, res, next) {
  let users = await userModel.find({ isDeleted: false }).populate({ path: 'role', select: 'name' });
  res.send(users);
});

// GET /api/v1/users/:id
router.get('/:id', CheckLogin, CheckRole('ADMIN'), async function (req, res, next) {
  try {
    let result = await userModel.findOne({ _id: req.params.id, isDeleted: false }).populate('role').populate('department');
    if (result) return res.send(result);
    res.status(404).send({ message: 'Không tìm thấy user' });
  } catch (e) { res.status(404).send({ message: 'ID không hợp lệ' }); }
});

// POST /api/v1/users
router.post('/', CreateUserValidator, validationResult, async function (req, res, next) {
  try {
    let newItem = await userController.CreateAnUser(req.body.username, req.body.password, req.body.email, req.body.role);
    res.send(newItem);
  } catch (err) { res.status(400).send({ message: err.message }); }
});

// PUT /api/v1/users/:id
router.put('/:id', CheckLogin, async function (req, res, next) {
  try {
    let updated = await userModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).send({ message: 'Không tìm thấy user' });
    res.send(updated);
  } catch (err) { res.status(400).send({ message: err.message }); }
});

// DELETE /api/v1/users/:id — xóa mềm
router.delete('/:id', CheckLogin, CheckRole('ADMIN'), async function (req, res, next) {
  try {
    let updated = await userModel.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!updated) return res.status(404).send({ message: 'Không tìm thấy user' });
    res.send(updated);
  } catch (err) { res.status(400).send({ message: err.message }); }
});

module.exports = router;
