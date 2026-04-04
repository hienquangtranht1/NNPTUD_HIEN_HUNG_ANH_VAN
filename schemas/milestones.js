const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  dueDate: { type: Date }, // Hạn chót của cột mốc
  status: { 
    type: String, 
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'],
    default: 'PENDING' 
  },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Milestone', milestoneSchema);
