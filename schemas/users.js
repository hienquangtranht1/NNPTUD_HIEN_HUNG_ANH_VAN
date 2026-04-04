let mongoose = require('mongoose');
let bcrypt = require('bcrypt');

let userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  avatarUrl: { type: String },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  loginCount: { type: Number, default: 0 },
  lockTime: { type: Date },
  forgotPasswordToken: { type: String },
  forgotPasswordTokenExp: { type: Date },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Mã hoá mật khẩu bằng thuật toán Bcrypt trước khi lưu database
// => Bảo vệ chống lại tấn công Rainbow Table
userSchema.pre('save', function () {
  if (this.isModified('password')) {
    let salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
  }
});

module.exports = mongoose.model('User', userSchema);
