const express = require('express');
const router = express.Router();
const tagModel = require('../schemas/tags');
const { CheckLogin, CheckRole } = require('../utils/authHandler');

// GET /api/v1/tags
router.get('/', CheckLogin, async (req, res) => {
  try {
    const tags = await tagModel.find({ isDeleted: false });
    res.json({ data: tags });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/v1/tags/:id
router.get('/:id', CheckLogin, async (req, res) => {
  try {
    const tag = await tagModel.findOne({ _id: req.params.id, isDeleted: false });
    if (!tag) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(tag);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/v1/tags
router.post('/', CheckLogin, CheckRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { name, color } = req.body;
    const tag = new tagModel({ name, color });
    await tag.save();
    res.status(201).json(tag);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT /api/v1/tags/:id
router.put('/:id', CheckLogin, CheckRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { name, color } = req.body;
    const tag = await tagModel.findByIdAndUpdate(req.params.id, { name, color }, { new: true });
    res.json(tag);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/v1/tags/:id
router.delete('/:id', CheckLogin, CheckRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const tag = await tagModel.findByIdAndUpdate(req.params.id, { isDeleted: true });
    if (!tag) return res.status(404).json({ message: 'Nhãn không tồn tại' });
    res.json({ message: 'Đã xóa nhãn' });
  } catch (err) { res.status(400).json({ message: 'ID không hợp lệ' }); }
});

module.exports = router;
