let mongoose = require('mongoose');

let roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Thường là ADMIN, MANAGER, MEMBER
  description: { type: String },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
