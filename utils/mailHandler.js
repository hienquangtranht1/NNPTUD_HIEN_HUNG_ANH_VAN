// mailHandler.js — Gửi email (VD: link quên mật khẩu)
// HIỂN: Cài nodemailer và cấu hình SMTP vào đây khi cần
let sendMail = async function (to, url) {
  console.log(`[Mail] Gửi tới: ${to} | Link: ${url}`);
  // const nodemailer = require('nodemailer');
  // let transporter = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 587, auth: { user: '...', pass: '...' } });
  // await transporter.sendMail({ from: 'no-reply@qltask.com', to, subject: 'Reset Password QLTASK', html: `<a href="${url}">Đặt lại mật khẩu</a>` });
};
module.exports = { sendMail };
