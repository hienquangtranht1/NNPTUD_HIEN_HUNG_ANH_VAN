const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  thumbnail: { type: String }, // Ảnh đính kèm task
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Người thực hiện
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Người tạo
  priority: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM' 
  },
  status: { 
    type: String, 
    enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
    default: 'TODO' 
  },
  dueDate: { type: Date },
  completedAt: { type: Date },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
