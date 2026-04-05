const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  colorCode: { type: String, default: '#e74c3c' }, // colorCode: #e74c3c
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Tag', tagSchema);
