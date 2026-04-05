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
  let query = { isDeleted: false };
  
  // Nếu là MANAGER, chỉ xem được thành viên trong phòng của mình
  if (req.user.role.name === 'MANAGER') {
    if (!req.user.department) return res.send([]); // Chưa gán phòng thì ko thấy ai
    query.department = req.user.department;
  }

  let users = await userModel.find(query).populate({ path: 'role', select: 'name' }).populate({ path: 'department', select: 'name' });
  res.send(users);
});

// GET /api/v1/users/:id (ADMIN hoặc chính chủ)
router.get('/:id', CheckLogin, async function (req, res, next) {
  let userRole = req.user.role && req.user.role.name;
  // Cho phép đi tiếp nếu là ADMIN hoặc ID truy cập trùng khớp với ID của Token
  if (userRole !== 'ADMIN' && req.user._id.toString() !== req.params.id) {
    return res.status(403).send({ message: 'Không đủ quyền. Chỉ ADMIN hoặc chủ tài khoản mới được xem' });
  }
  try {
    let result = await userModel.findOne({ _id: req.params.id, isDeleted: false }).populate('role').populate('department');
    if (result) return res.send(result);
    res.status(404).send({ message: 'Không tìm thấy user' });
  } catch (e) { res.status(404).send({ message: 'ID không hợp lệ' }); }
});

// POST /api/v1/users (Chỉ ADMIN)
router.post('/', CheckLogin, CheckRole('ADMIN'), CreateUserValidator, validationResult, async function (req, res, next) {
  try {
    let newItem = await userController.CreateAnUser(
      req.body.username, req.body.password, req.body.email, 
      req.body.role, null, req.body.fullName, null, req.body.department
    );
    res.send(newItem);
  } catch (err) { res.status(400).send({ message: err.message }); }
});

// PUT /api/v1/users/:id (Chỉ ADMIN, MANAGER hoặc Chính chủ)
router.put('/:id', CheckLogin, async function (req, res, next) {
  let userRole = req.user.role && req.user.role.name;
  if (userRole !== 'ADMIN' && userRole !== 'MANAGER' && req.user._id.toString() !== req.params.id) {
    return res.status(403).send({ message: 'Không đủ quyền. Chỉ Quản lý hoặc chủ tài khoản mới được sửa' });
  }

  // Chống lỗi bảo mật thăng cấp đặc quyền (Mass Assignment)
  let updateData = { ...req.body };
  if (userRole !== 'ADMIN') {
    delete updateData.role; // Chỉ ADMIN mới đổi được chức vụ
    delete updateData.department; // Chỉ ADMIN mới đổi được phòng ban
    delete updateData.isDeleted; // Hạn chế tự sửa status khoá tài khoản
  }

  try {
    let updated = await userModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
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
