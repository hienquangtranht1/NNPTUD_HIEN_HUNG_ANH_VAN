const express = require('express');
const router = express.Router();
const taskHistoryModel = require('../schemas/taskHistories');
const { CheckLogin } = require('../utils/authHandler');

// GET /api/v1/taskHistories?taskId=xxx
router.get('/', CheckLogin, async (req, res) => {
  try {
    const { taskId } = req.query;
    if (!taskId) return res.status(400).json({ message: 'Tiền tố taskId là bắt buộc' });
    
    const histories = await taskHistoryModel.find({ taskId })
      .populate('changedBy', 'fullName username')
      .sort({ changedAt: -1 });
      
    res.json({ data: histories });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
