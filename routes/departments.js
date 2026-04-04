// routes/departments.js — HIỂN phụ trách
var express = require('express');
var router = express.Router();
let departmentModel = require('../schemas/departments');
let { CheckLogin, CheckRole } = require('../utils/authHandler');

// GET /api/v1/departments
router.get('/', async function (req, res, next) {
  let nameQ = req.query.name ? req.query.name : '';
  let data = await departmentModel.find({
    isDeleted: false,
    name: new RegExp(nameQ, 'i')
  });
  res.send(data);
});

// POST /api/v1/departments — Tạo phòng ban mới
router.post('/', CheckLogin, CheckRole('ADMIN'), async function (req, res, next) {
  try {
    let newItem = new departmentModel({
      name: req.body.name,
      description: req.body.description
    });
    await newItem.save();
    res.send(newItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// PUT /api/v1/departments/:id
router.put('/:id', CheckLogin, CheckRole('ADMIN'), async function (req, res, next) {
  try {
    let updatedItem = await departmentModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) return res.status(404).send({ message: 'Không tìm thấy phòng ban' });
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// DELETE /api/v1/departments/:id
router.delete('/:id', CheckLogin, CheckRole('ADMIN'), async function (req, res, next) {
  try {
    let item = await departmentModel.findOne({ _id: req.params.id, isDeleted: false });
    if (!item) return res.status(404).send({ message: 'Không tìm thấy phòng ban' });
    item.isDeleted = true;
    await item.save();
    res.send(item);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = router;
