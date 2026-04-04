let mongoose = require('mongoose');

let notificationSchema = new mongoose.Schema({
  content:   { type: String, required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  isRead:    { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('notifications', notificationSchema);
