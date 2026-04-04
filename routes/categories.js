const express = require('express');
const router = express.Router();
const categoryModel = require('../schemas/categories');
const { CheckLogin, CheckRole } = require('../utils/authHandler');
const upload = require('../utils/uploadHandler');

// GET all
router.get('/', CheckLogin, async (req, res) => {
  try {
    const cats = await categoryModel.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json(cats);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET detail
router.get('/:id', CheckLogin, async (req, res) => {
  try {
    const c = await categoryModel.findOne({ _id: req.params.id, isDeleted: false });
    if (!c) return res.status(404).json({ message: 'Danh mục không tồn tại' });
    res.json(c);
  } catch (err) { res.status(400).json({ message: 'ID không hợp lệ' }); }
});

// POST create
router.post('/', CheckLogin, CheckRole('ADMIN', 'MANAGER'), upload.single('image'), async (req, res) => {
  try {
    const c = new categoryModel(req.body);
    await c.save();
    res.status(201).json(c);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT update
router.put('/:id', CheckLogin, CheckRole('ADMIN', 'MANAGER'), upload.single('image'), async (req, res) => {
  try {
    const c = await categoryModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!c) return res.status(404).json({ message: 'Danh mục không tồn tại' });
    res.json(c);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE soft
router.delete('/:id', CheckLogin, CheckRole('ADMIN'), async (req, res) => {
  try {
    const c = await categoryModel.findByIdAndUpdate(req.params.id, { isDeleted: true });
    if (!c) return res.status(404).json({ message: 'Danh mục không tồn tại' });
    res.json({ message: 'Đã xóa danh mục' });
  } catch (err) { res.status(400).json({ message: 'ID không hợp lệ' }); }
});

module.exports = router;
