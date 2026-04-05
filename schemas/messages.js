let mongoose = require('mongoose');

let MessageSchema = new mongoose.Schema({
  content:  { type: String, required: true },
  sender:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task:     { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }, // tiến độ task liên quan (tuỳ chọn)
  isRead:   { type: Boolean, default: false }
}, { timestamps: true });

// Index để tra cứu hội thoại 2 chiều nhanh hơn
MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ receiver: 1, isRead: 1 });

module.exports = mongoose.model('Message', MessageSchema);
