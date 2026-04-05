// routes/notifications.js — VÂN phụ trách
var express = require('express');
var router = express.Router();
let Notification = require('../schemas/notifications');
let { CheckLogin, CheckRole } = require('../utils/authHandler');

// GET /api/v1/notifications — Lấy danh sách thông báo của người đang đăng nhập
router.get('/', CheckLogin, async function (req, res) {
  try {
    let notifications = await Notification.find({ recipient: req.user._id })
      .populate('recipient', 'username fullName')
      .populate('task', 'title')
      .sort({ createdAt: -1 });
    res.send(notifications);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// POST /api/v1/notifications — ADMIN/MANAGER Gửi thông báo
router.post('/', CheckLogin, CheckRole('ADMIN', 'MANAGER'), async function (req, res) {
  try {
    let { content, recipient, task } = req.body;
    if (!content || !recipient) {
      return res.status(400).send({ message: 'Nội dung và người nhận là bắt buộc' });
    }
    let notification = new Notification({ content, recipient, task });
    await notification.save();
    res.send(notification);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// POST /api/v1/notifications/department/:departmentId — ADMIN/MANAGER gửi thông báo cho toàn bộ phòng ban
router.post('/department/:departmentId', CheckLogin, CheckRole('ADMIN', 'MANAGER'), async function (req, res) {
  try {
    let { content, task } = req.body;
    if (!content) {
      return res.status(400).send({ message: 'Nội dung thông báo là bắt buộc' });
    }

    let Department = require('../schemas/departments');
    let User = require('../schemas/users');

    // Kiểm tra phòng ban tồn tại
    let department = await Department.findOne({ _id: req.params.departmentId, isDeleted: false });
    if (!department) {
      return res.status(404).send({ message: 'Không tìm thấy phòng ban' });
    }

    // MANAGER chỉ được gửi cho phòng mình
    if (req.user.role.name === 'MANAGER' && req.user.department?.toString() !== req.params.departmentId) {
      return res.status(403).send({ message: 'Bạn không có quyền gửi thông báo cho phòng ban khác' });
    }

    // Lấy tất cả thành viên trong phòng ban
    let members = await User.find({ department: req.params.departmentId, isDeleted: false }).select('_id fullName');
    if (members.length === 0) {
      return res.status(404).send({ message: 'Phòng ban này hiện không có thành viên nào' });
    }

    // Tạo thông báo cho từng thành viên
    let notifications = members.map(member => ({
      content,
      recipient: member._id,
      task: task || undefined
    }));

    let created = await Notification.insertMany(notifications);

    res.send({
      message: `Đã gửi thông báo thành công đến ${created.length} thành viên trong phòng "${department.name}"`,
      department: department.name,
      totalSent: created.length,
      recipients: members.map(m => ({ _id: m._id, fullName: m.fullName }))
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// PUT /api/v1/notifications/:id/read — Đánh dấu đã đọc
router.put('/:id/read', CheckLogin, async function (req, res) {
  try {
    let notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).send({ message: 'Không tìm thấy thông báo hoặc bạn không có quyền' });
    res.send(notification);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
