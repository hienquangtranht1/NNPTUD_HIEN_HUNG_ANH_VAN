const express = require('express');
const router = express.Router();
const taskModel = require('../schemas/tasks');
const { CheckLogin, CheckRole } = require('../utils/authHandler');
const upload = require('../utils/uploadHandler');

// GET all
router.get('/', CheckLogin, async (req, res) => {
  try {
    const { status, project, search } = req.query;
    let query = { isDeleted: false };
    if (status) query.status = status;
    if (project) query.project = project;
    if (search) query.title = { $regex: search, $options: 'i' };

    const tasks = await taskModel.find(query)
      .populate('project assignee reporter')
      .sort({ createdAt: -1 });
    res.json({ data: tasks });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET detail
router.get('/:id', CheckLogin, async (req, res) => {
  try {
    const t = await taskModel.findOne({ _id: req.params.id, isDeleted: false }).populate('project assignee reporter');
    if (!t) return res.status(404).json({ message: 'Công việc không tồn tại' });
    res.json(t);
  } catch (err) { res.status(400).json({ message: 'ID không hợp lệ' }); }
});

// POST create
router.post('/', CheckLogin, CheckRole('ADMIN', 'MANAGER'), upload.single('image'), async (req, res) => {
  try {
    let body = req.body;
    if (req.file) body.thumbnail = `/uploads/${req.file.filename}`;
    body.reporter = req.user._id;

    const t = new taskModel(body);
    await t.save();
    res.status(201).json(t);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT update (Dùng cho kéo thả Kanban)
router.put('/:id', CheckLogin, CheckRole('ADMIN', 'MANAGER'), upload.single('image'), async (req, res) => {
  try {
    let body = req.body;
    if (req.file) body.thumbnail = `/uploads/${req.file.filename}`;
    
    // Nếu đổi sang DONE thì ghi nhận ngày hoàn thành
    if (body.status === 'DONE') body.completedAt = new Date();

    const t = await taskModel.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!t) return res.status(404).json({ message: 'Công việc không tồn tại' });
    res.json(t);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE soft
router.delete('/:id', CheckLogin, CheckRole('ADMIN'), async (req, res) => {
  try {
    const t = await taskModel.findByIdAndUpdate(req.params.id, { isDeleted: true });
    if (!t) return res.status(404).json({ message: 'Công việc không tồn tại' });
    res.json({ message: 'Đã xóa công việc' });
  } catch (err) { res.status(400).json({ message: 'ID không hợp lệ' }); }
});

module.exports = router;
