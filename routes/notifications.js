// routes/notifications.js — VÂN phụ trách
var express = require('express');
var router = express.Router();
let Notification = require('../schemas/notifications');

// GET /api/v1/notifications?userId=xxx — Lấy danh sách thông báo của 1 user
router.get('/', async function (req, res) {
  try {
    let filter = { isDeleted: false };
    if (req.query.userId) filter.userId = req.query.userId;
    let notifications = await Notification.find(filter)
      .populate('userId', 'username fullName')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 });
    res.send(notifications);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// GET /api/v1/notifications/:id — Xem chi tiết 1 thông báo
router.get('/:id', async function (req, res) {
  try {
    let notification = await Notification.findOne({ _id: req.params.id, isDeleted: false })
      .populate('userId', 'username fullName')
      .populate('taskId', 'title');
    if (!notification) return res.status(404).send({ message: 'Không tìm thấy thông báo' });
    res.send(notification);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// POST /api/v1/notifications — Tạo thông báo thủ công
router.post('/', async function (req, res) {
  try {
    let { content, userId, taskId } = req.body;
    if (!content || !userId) {
      return res.status(400).send({ message: 'Thiếu content hoặc userId' });
    }
    let notification = new Notification({ content, userId, taskId });
    await notification.save();
    res.send(notification);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// PUT /api/v1/notifications/:id/read — Đánh dấu đã đọc (isRead = true)
router.put('/:id/read', async function (req, res) {
  try {
    let notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).send({ message: 'Không tìm thấy thông báo' });
    res.send(notification);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// DELETE /api/v1/notifications/:id — Xóa mềm thông báo
router.delete('/:id', async function (req, res) {
  try {
    let notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!notification) return res.status(404).send({ message: 'Không tìm thấy thông báo' });
    res.send({ message: 'Đã xóa thông báo', notification });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
