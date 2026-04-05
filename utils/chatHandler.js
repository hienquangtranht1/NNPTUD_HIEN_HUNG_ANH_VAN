const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const userSchema = require('../schemas/users');

// Đọc khoá Public Key phục vụ Verify (RS256)
const publicKey = fs.readFileSync(path.join(__dirname, '../public.pem'), 'utf8');

module.exports = {
  handleChat: function (server) {
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    console.log('[ChatHandler] Đã khởi động máy chủ WebSockets (Socket.IO)');

    // Bắt và kiểm tra Middleware JWT Token cho luồng Socket
    io.use((socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Chưa đăng nhập. Vui lòng cung cấp token.'));
      }
      
      try {
        let result = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
        if (result.exp * 1000 < Date.now()) {
          return next(new Error('Token đã hết hạn.'));
        }
        socket.decodedTokenId = result.id;
        next();
      } catch (error) {
        return next(new Error('Sai thông tin xác thực Socket'));
      }
    });

    io.on('connection', async (socket) => {
      let id = socket.decodedTokenId;
      try {
        let user = await userSchema.findById(id);
        if (!user || user.isDeleted) {
          socket.disconnect();
          return;
        }
        
        console.log(`[Chat] User Connected: ${user.username} (${id})`);
        
        // Cho User join vào chính TÊN PHÒNG LÀ ID CỦA HỌ
        socket.join(id);
        socket.emit('welcome', user.username);
        
        // Khi user gửi sự kiện join vào room cụ thể
        socket.on('userMessage', data => {
          console.log(`[Chat] ${user.username} vửa xin join phòng (userMessage): ` + data);
          socket.join(data);
        });
        
        // Khi user chủ động gửi tin nhắn cho người khác
        socket.on('newMessage', data => {
          // data.to: ID của người nhận
          // data.from: ID của mình
          console.log(`[Chat] ${user.username} gửi tinnewMessage tới ${data.to}`);
          io.to(data.to).to(data.from).emit("newMessage", data);
        });

        socket.on('disconnect', () => {
          console.log(`[Chat] User Disconnected: ${user.username}`);
        });

      } catch (e) {
        console.error(e);
        socket.disconnect();
      }
    });
  }
};
