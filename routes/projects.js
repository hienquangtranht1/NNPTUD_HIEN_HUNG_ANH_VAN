const express = require('express');
const router = express.Router();
const projectModel = require('../schemas/projects');
const { CheckLogin, CheckRole } = require('../utils/authHandler');
const upload = require('../utils/uploadHandler');

// GET all projects
router.get('/', CheckLogin, async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 50, departmentId } = req.query;
    let query = { isDeleted: false };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) query.name = { $regex: search, $options: 'i' };

    // MANAGER chỉ xem dự án của phòng mình
    const role = req.user.role?.name;
    if (role === 'MANAGER') {
      if (!req.user.department) return res.json({ data: [], pagination: { total: 0 } });
      query.department = req.user.department;
    } else if (role === 'ADMIN' && departmentId) {
      query.department = departmentId;
    }

    const data = await projectModel.find(query)
      .populate('manager', 'username fullName')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await projectModel.countDocuments(query);
    res.json({ data, pagination: { total, page, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET detail
router.get('/:id', CheckLogin, async (req, res) => {
  try {
    const p = await projectModel.findOne({ _id: req.params.id, isDeleted: false })
      .populate('manager', 'username fullName')
      .populate('members', 'username fullName')
      .populate('department', 'name');
    if (!p) return res.status(404).json({ message: 'Dự án không tồn tại' });
    res.json(p);
  } catch (err) { res.status(400).json({ message: 'ID không hợp lệ' }); }
});

// POST create
router.post('/', CheckLogin, CheckRole('ADMIN', 'MANAGER'), upload.single('image'), async (req, res) => {
  try {
    let body = req.body;
    if (req.file) body.thumbnail = `/uploads/${req.file.filename}`;
    if (!body.manager) body.manager = req.user._id;

    // MANAGER: tự động gán phòng ban của mình
    if (req.user.role?.name === 'MANAGER') {
      body.department = req.user.department;
    }

    const p = new projectModel(body);
    await p.save();
    const populated = await projectModel.findById(p._id).populate('department', 'name').populate('manager', 'fullName username');
    res.status(201).json(populated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT update
router.put('/:id', CheckLogin, CheckRole('ADMIN', 'MANAGER'), upload.single('image'), async (req, res) => {
  try {
    let body = req.body;
    if (req.file) body.thumbnail = `/uploads/${req.file.filename}`;
    
    const p = await projectModel.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!p) return res.status(404).json({ message: 'Dự án không tồn tại' });
    res.json(p);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE soft
router.delete('/:id', CheckLogin, CheckRole('ADMIN'), async (req, res) => {
  try {
    const p = await projectModel.findByIdAndUpdate(req.params.id, { isDeleted: true });
    if (!p) return res.status(404).json({ message: 'Dự án không tồn tại' });
    res.json({ message: 'Đã xóa dự án' });
  } catch (err) { res.status(400).json({ message: 'ID không hợp lệ' }); }
});

module.exports = router;
