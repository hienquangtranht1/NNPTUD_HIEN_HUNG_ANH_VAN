const nodemailer = require('nodemailer');

const sendMail = async (email, url) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "no-reply@test.com", // Ban co the tu config tai day
      pass: "testpassword" // Password ung dung quyen Google
    },
  });

  let info = await transporter.sendMail({
    from: '"Task Manager" <no-reply@taskmanager.com>',
    to: email, 
    subject: "Reset Password", 
    html: `<b>Click vao duong link de reset mat khau:</b><br><a href="${url}">${url}</a>`, 
  });
};

module.exports = { sendMail };
