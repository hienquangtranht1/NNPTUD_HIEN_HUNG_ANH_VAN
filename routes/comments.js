// routes/comments.js — VÂN phụ trách
var express = require('express');
var router = express.Router();
let Comment = require('../schemas/comments');
let { CheckLogin } = require('../utils/authHandler');

// GET /api/v1/comments?taskId=xxx — Lấy tất cả bình luận của 1 task
router.get('/', CheckLogin, async function (req, res) {
  try {
    let filter = {};
    if (req.query.taskId) filter.task = req.query.taskId;
    
    let comments = await Comment.find(filter)
      .populate('user', 'username fullName')
      .populate('task', 'title')
      .sort({ createdAt: 1 });
    res.send(comments);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// POST /api/v1/comments — Viết bình luận mới
router.post('/', CheckLogin, async function (req, res) {
  try {
    let { content, task } = req.body;
    if (!content || !task) {
      return res.status(400).send({ message: 'Nội dung và taskId là bắt buộc' });
    }
    let comment = new Comment({ 
      content, 
      task, 
      user: req.user._id // Lấy user từ token đăng nhập
    });
    await comment.save();
    
    // Trả về cả thông tin user để hiển thị ngay
    let populated = await Comment.findById(comment._id).populate('user', 'username fullName');
    res.send(populated);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// DELETE /api/v1/comments/:id — Chỉ cho phép người tạo xóa
router.delete('/:id', CheckLogin, async function (req, res) {
  try {
    let comment = await Comment.findOne({ _id: req.params.id, user: req.user._id });
    if (!comment) return res.status(403).send({ message: 'Bạn không có quyền xóa bình luận này' });
    await comment.deleteOne();
    res.send({ message: 'Đã xóa bình luận' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
