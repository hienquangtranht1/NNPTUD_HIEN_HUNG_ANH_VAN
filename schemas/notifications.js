let mongoose = require('mongoose');

let NotificationSchema = new mongoose.Schema({
  content: { type: String, required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isRead: { type: Boolean, default: false },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' } // Related task if applicable
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
