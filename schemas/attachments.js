let mongoose = require('mongoose');

let AttachmentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Attachment', AttachmentSchema);
