// routes/messages.js — Chat tiến độ: User <-> Manager
var express = require('express');
var router = express.Router();
let Message = require('../schemas/messages');
let User = require('../schemas/users');
let { CheckLogin } = require('../utils/authHandler');

// ─────────────────────────────────────────────
// GET /api/v1/messages/contacts
// Trả về danh sách người có thể chat:
//   - Nếu là ADMIN/MANAGER: tất cả user trong cùng phòng ban
//   - Nếu là USER: manager của phòng ban mình
// ─────────────────────────────────────────────
router.get('/contacts', CheckLogin, async function (req, res) {
  try {
    const me = req.user;
    const role = me.role?.name;

    let contacts = [];

    if (role === 'ADMIN') {
      // ADMIN thấy tất cả user (trừ bản thân)
      contacts = await User.find({ _id: { $ne: me._id }, isDeleted: false })
        .select('fullName username email avatarUrl role department')
        .populate('role', 'name')
        .populate('department', 'name');
    } else if (role === 'MANAGER') {
      // MANAGER thấy tất cả user trong phòng mình
      if (!me.department) return res.send([]);
      contacts = await User.find({
        department: me.department,
        _id: { $ne: me._id },
        isDeleted: false
      }).select('fullName username email avatarUrl role department')
        .populate('role', 'name')
        .populate('department', 'name');
    } else {
      // USER thường: thấy manager + admin trong cùng phòng ban
      if (!me.department) return res.send([]);
      contacts = await User.find({
        department: me.department,
        _id: { $ne: me._id },
        isDeleted: false
      }).select('fullName username email avatarUrl role department')
        .populate('role', 'name')
        .populate('department', 'name');
    }

    // Thêm số tin chưa đọc từ mỗi contact
    const withUnread = await Promise.all(contacts.map(async (c) => {
      const unread = await Message.countDocuments({
        sender: c._id,
        receiver: me._id,
        isRead: false
      });
      return { ...c.toObject(), unreadCount: unread };
    }));

    res.send(withUnread);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/v1/messages/conversation/:userId
// Lấy lịch sử chat với 1 người, đồng thời đánh dấu đã đọc
// ─────────────────────────────────────────────
router.get('/conversation/:userId', CheckLogin, async function (req, res) {
  try {
    const me = req.user._id;
    const other = req.params.userId;

    // Đánh dấu đã đọc tất cả tin nhắn từ người kia gửi cho mình
    await Message.updateMany(
      { sender: other, receiver: me, isRead: false },
      { isRead: true }
    );

    const messages = await Message.find({
      $or: [
        { sender: me, receiver: other },
        { sender: other, receiver: me }
      ]
    })
      .populate('sender', 'fullName username')
      .populate('task', 'title status')
      .sort({ createdAt: 1 })
      .limit(100); // giới hạn 100 tin gần nhất

    res.send(messages);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/v1/messages — Gửi tin nhắn mới
// Body: { receiver, content, task? }
// ─────────────────────────────────────────────
router.post('/', CheckLogin, async function (req, res) {
  try {
    const { receiver, content, task } = req.body;
    if (!receiver || !content?.trim()) {
      return res.status(400).send({ message: 'Người nhận và nội dung là bắt buộc' });
    }

    // Kiểm tra người nhận tồn tại
    const receiverUser = await User.findOne({ _id: receiver, isDeleted: false });
    if (!receiverUser) return res.status(404).send({ message: 'Người nhận không tồn tại' });

    const msg = new Message({
      sender: req.user._id,
      receiver,
      content: content.trim(),
      task: task || undefined
    });
    await msg.save();

    const populated = await Message.findById(msg._id)
      .populate('sender', 'fullName username')
      .populate('task', 'title status');

    res.send(populated);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/v1/messages/unread-count
// Tổng số tin nhắn chưa đọc (dùng cho badge)
// ─────────────────────────────────────────────
router.get('/unread-count', CheckLogin, async function (req, res) {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });
    res.send({ count });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
