let mongoose = require('mongoose');

let attachmentSchema = new mongoose.Schema({
  filename:   { type: String, required: true },
  url:        { type: String, required: true },
  taskId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted:  { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('attachments', attachmentSchema);
