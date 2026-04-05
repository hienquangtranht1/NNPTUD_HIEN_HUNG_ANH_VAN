const express = require('express');
const router = express.Router();
const taskModel = require('../schemas/tasks');
const taskHistoryModel = require('../schemas/taskHistories');
const { CheckLogin, CheckRole } = require('../utils/authHandler');
const { CreateTaskValidator, validationResult } = require('../utils/validatorHandler');
const upload = require('../utils/uploadHandler');

// GET all /api/v1/tasks
// Supported filters: status, assigneeId, projectId, departmentId
router.get('/', CheckLogin, async (req, res) => {
  try {
    const { status, assigneeId, projectId, categoryId, search, departmentId } = req.query;
    let query = { isDeleted: false };

    if (status) query.status = status.toUpperCase();
    if (assigneeId) query.assignee = assigneeId;
    if (projectId) query.project = projectId;
    if (categoryId) query.category = categoryId;
    if (search) query.title = { $regex: search, $options: 'i' };

    // MANAGER chỉ xem task của phòng mình
    const role = req.user.role?.name;
    if (role === 'MANAGER' || departmentId) {
      const projectModel = require('../schemas/projects');
      const deptId = role === 'MANAGER' ? req.user.department : departmentId;
      if (!deptId) return res.json({ data: [] });
      const deptProjects = await projectModel.find({ department: deptId, isDeleted: false }).select('_id');
      const projectIds = deptProjects.map(p => p._id);
      if (!query.project) query.project = { $in: projectIds };
    }

    const tasks = await taskModel.find(query)
      .populate('project', 'name department')
      .populate('assignee', 'fullName username')
      .populate('reporter', 'fullName username')
      .populate('tags')
      .sort({ createdAt: -1 });

    res.json({ data: tasks });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET detail /api/v1/tasks/:id
router.get('/:id', CheckLogin, async (req, res) => {
  try {
    const t = await taskModel.findOne({ _id: req.params.id, isDeleted: false })
      .populate('project', 'projectName')
      .populate('assignee', 'fullName username')
      .populate('reporter', 'fullName username')
      .populate('tags');

    if (!t) return res.status(404).json({ message: 'Công việc không tồn tại' });
    res.json(t);
  } catch (err) { res.status(400).json({ message: 'ID không hợp lệ' }); }
});

// POST create /api/v1/tasks
router.post('/', CheckLogin, CheckRole('ADMIN', 'MANAGER'), CreateTaskValidator, validationResult, upload.single('image'), async (req, res) => {
  try {
    let body = req.body;
    if (req.file) body.thumbnail = `/uploads/${req.file.filename}`;

    // Map fields from request to schema
    const taskData = {
      title: body.title,
      description: body.description,
      dueDate: body.dueDate,
      status: body.status || 'TODO',
      reporter: req.user._id, // người giao
      project: body.projectId || body.project,
      assignee: body.assigneeId || body.assignee, // người nhận
      category: body.categoryId || body.category
    };

    const t = new taskModel(taskData);
    await t.save();
    res.status(201).json(t);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT update /api/v1/tasks/:id
// Logic: If status changes, record history
router.put('/:id', CheckLogin, CheckRole('ADMIN', 'MANAGER'), upload.single('image'), async (req, res) => {
  try {
    let body = req.body;
    if (req.file) body.thumbnail = `/uploads/${req.file.filename}`;

    const oldTask = await taskModel.findById(req.params.id);
    if (!oldTask) return res.status(404).json({ message: 'Công việc không tồn tại' });

    // Map fields for update
    const updateData = { ...body };
    if (body.projectId) updateData.project = body.projectId;
    if (body.assigneeId) updateData.assignee = body.assigneeId;
    if (body.categoryId) updateData.category = body.categoryId;

    // Check for status change
    if (body.status && body.status !== oldTask.status) {
      // Record history
      const history = new taskHistoryModel({
        taskId: oldTask._id,
        changedBy: req.user._id,
        oldStatus: oldTask.status,
        newStatus: body.status
      });
      await history.save();

      if (body.status === 'DONE') updateData.completedAt = new Date();
    }

    const t = await taskModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(t);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT /api/v1/tasks/:id/tags -> Gắn/Gỡ nhãn cho 1 task
router.put('/:id/tags', CheckLogin, CheckRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { tags } = req.body; // Expecting an array of tag IDs
    const t = await taskModel.findByIdAndUpdate(
      req.params.id,
      { tags: tags },
      { new: true }
    ).populate('tags');

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
