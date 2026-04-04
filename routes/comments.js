// routes/comments.js — VÂN phụ trách
var express = require('express');
var router = express.Router();
let Comment = require('../schemas/comments');

// GET /api/v1/comments?taskId=xxx — Lấy tất cả bình luận của 1 task
router.get('/', async function (req, res) {
  try {
    let filter = { isDeleted: false };
    if (req.query.taskId) filter.taskId = req.query.taskId;
    let comments = await Comment.find(filter)
      .populate('userId', 'username fullName')
      .populate('taskId', 'title')
      .sort({ createdAt: 1 });
    res.send(comments);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// GET /api/v1/comments/:id — Xem chi tiết 1 bình luận
router.get('/:id', async function (req, res) {
  try {
    let comment = await Comment.findOne({ _id: req.params.id, isDeleted: false })
      .populate('userId', 'username fullName')
      .populate('taskId', 'title');
    if (!comment) return res.status(404).send({ message: 'Không tìm thấy bình luận' });
    res.send(comment);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// POST /api/v1/comments — Viết bình luận mới
router.post('/', async function (req, res) {
  try {
    let { content, taskId, userId } = req.body;
    if (!content || !taskId || !userId) {
      return res.status(400).send({ message: 'Thiếu content, taskId hoặc userId' });
    }
    let comment = new Comment({ content, taskId, userId });
    await comment.save();
    res.send(comment);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// PUT /api/v1/comments/:id — Chỉnh sửa nội dung bình luận
router.put('/:id', async function (req, res) {
  try {
    let comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content },
      { new: true }
    );
    if (!comment) return res.status(404).send({ message: 'Không tìm thấy bình luận' });
    res.send(comment);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// DELETE /api/v1/comments/:id — Xóa mềm bình luận
router.delete('/:id', async function (req, res) {
  try {
    let comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!comment) return res.status(404).send({ message: 'Không tìm thấy bình luận' });
    res.send({ message: 'Đã xóa bình luận', comment });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
