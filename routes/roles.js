// routes/roles.js — HIỂN phụ trách
var express = require('express');
var router = express.Router();
let roleModel = require('../schemas/roles');
let { CheckLogin, CheckRole } = require('../utils/authHandler');

// GET /api/v1/roles — Chỉ ADMIN, MANAGER mới xem được danh sách role
router.get('/', CheckLogin, CheckRole('ADMIN', 'MANAGER'), async function (req, res, next) {
  let data = await roleModel.find({ isDeleted: false });
  res.send(data);
});

// GET /api/v1/roles/public — Lấy danh sách role cho trang đăng ký (bỏ qua ADMIN)
router.get('/public', async function (req, res, next) {
  let data = await roleModel.find({ isDeleted: false, name: { $ne: 'ADMIN' } });
  res.send(data);
});

// POST /api/v1/roles — Tạo vai trò mới (Chỉ ADMIN)
router.post('/', CheckLogin, CheckRole('ADMIN'), async function (req, res, next) {
  try {
    let newItem = new roleModel({ name: req.body.name, description: req.body.description });
    await newItem.save();
    res.send(newItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// PUT /api/v1/roles/:id
router.put('/:id', CheckLogin, CheckRole('ADMIN'), async function (req, res, next) {
  try {
    let updatedItem = await roleModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) return res.status(404).send({ message: 'Không tìm thấy role' });
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// DELETE /api/v1/roles/:id
router.delete('/:id', CheckLogin, CheckRole('ADMIN'), async function (req, res, next) {
  try {
    let item = await roleModel.findOne({ _id: req.params.id, isDeleted: false });
    if (!item) return res.status(404).send({ message: 'Không tìm thấy role' });
    item.isDeleted = true;
    await item.save();
    res.send(item);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = router;
