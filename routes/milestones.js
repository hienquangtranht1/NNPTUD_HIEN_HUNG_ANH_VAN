const express = require('express');
const router = express.Router();
const milestoneModel = require('../schemas/milestones');
const projectModel = require('../schemas/projects');
const { CheckLogin, CheckRole } = require('../utils/authHandler');
const upload = require('../utils/uploadHandler');

// GET all
router.get('/', CheckLogin, async (req, res) => {
  try {
    const { status, project, departmentId } = req.query;
    let query = { isDeleted: false };
    if (status) query.status = status;
    if (project) query.project = project;

    const role = req.user.role?.name;
    // Nếu là MANAGER hoặc lọc theo phòng ban: tìm các project thuộc phòng đó
    if (role === 'MANAGER' || departmentId) {
      const deptId = role === 'MANAGER' ? req.user.department : departmentId;
      if (!deptId) return res.json([]);
      const deptProjects = await projectModel.find({ department: deptId, isDeleted: false }).select('_id');
      const projectIds = deptProjects.map(p => p._id);
      query.project = query.project ? query.project : { $in: projectIds };
    }

    const milestones = await milestoneModel.find(query)
      .populate('project', 'name department')
      .sort({ dueDate: 1 });
    res.json(milestones);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET detail
router.get('/:id', CheckLogin, async (req, res) => {
  try {
    const m = await milestoneModel.findOne({ _id: req.params.id, isDeleted: false }).populate('project');
    if (!m) return res.status(404).json({ message: 'Cột mốc không tồn tại' });
    res.json(m);
  } catch (err) { res.status(400).json({ message: 'ID không hợp lệ' }); }
});

// POST create
router.post('/', CheckLogin, CheckRole('ADMIN', 'MANAGER'), upload.single('image'), async (req, res) => {
  try {
    const { name, project } = req.body;
    if (!name || !project) return res.status(400).json({ message: 'Tên và dự án là bắt buộc' });

    // Kiểm tra dự án tồn tại
    const p = await projectModel.findById(project);
    if (!p) return res.status(400).json({ message: 'Dự án không tồn tại' });

    const m = new milestoneModel(req.body);
    await m.save();
    res.status(201).json(m);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT update
router.put('/:id', CheckLogin, CheckRole('ADMIN', 'MANAGER'), upload.single('image'), async (req, res) => {
  try {
    const m = await milestoneModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!m) return res.status(404).json({ message: 'Cột mốc không tồn tại' });
    res.json(m);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE soft
router.delete('/:id', CheckLogin, CheckRole('ADMIN'), async (req, res) => {
  try {
    const m = await milestoneModel.findByIdAndUpdate(req.params.id, { isDeleted: true });
    if (!m) return res.status(404).json({ message: 'Cột mốc không tồn tại' });
    res.json({ message: 'Đã xóa cột mốc' });
  } catch (err) { res.status(400).json({ message: 'ID không hợp lệ' }); }
});

module.exports = router;
