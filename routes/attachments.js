// routes/attachments.js — VÂN phụ trách
var express = require('express');
var router = express.Router();
let Attachment = require('../schemas/attachments');
const { CheckLogin } = require('../utils/authHandler');

// GET /api/v1/attachments?taskId=xxx — Lấy tất cả file đính kèm của 1 task
router.get('/', CheckLogin, async function (req, res) {
  try {
    let filter = { isDeleted: false };
    if (req.query.taskId) filter.task = req.query.taskId;
    let attachments = await Attachment.find(filter)
      .populate('uploadedBy', 'username fullName')
      .populate('task', 'title');
    res.send(attachments);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// GET /api/v1/attachments/:id — Xem chi tiết 1 file đính kèm
router.get('/:id', CheckLogin, async function (req, res) {
  try {
    let attachment = await Attachment.findOne({ _id: req.params.id, isDeleted: false })
      .populate('uploadedBy', 'username fullName')
      .populate('task', 'title');
    if (!attachment) return res.status(404).send({ message: 'Không tìm thấy file đính kèm' });
    res.send(attachment);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// POST /api/v1/attachments — Lưu thông tin file đính kèm vào DB
router.post('/', CheckLogin, async function (req, res) {
  try {
    let { filename, url, taskId } = req.body;
    if (!filename || !url || !taskId) {
      return res.status(400).send({ message: 'Thiếu filename, url hoặc taskId' });
    }
    let attachment = new Attachment({
      filename,
      url,
      task: taskId,
      uploadedBy: req.user._id
    });
    await attachment.save();
    res.send(attachment);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// DELETE /api/v1/attachments/:id — Xóa mềm đính kèm
router.delete('/:id', CheckLogin, async function (req, res) {
  try {
    let attachment = await Attachment.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!attachment) return res.status(404).send({ message: 'Không tìm thấy file đính kèm' });
    res.send({ message: 'Đã xóa file đính kèm', attachment });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
