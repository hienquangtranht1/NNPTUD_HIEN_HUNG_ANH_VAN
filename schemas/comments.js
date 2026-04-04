let mongoose = require('mongoose');

let commentSchema = new mongoose.Schema({
  content:   { type: String, required: true },
  taskId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('comments', commentSchema);
