// chatHandler.js — VÂN phụ trách (giữ theo cấu trúc mẫu thầy)
let handleChat = function (io) {
  io.on('connection', function (socket) {
    console.log('[Chat] Connected:', socket.id);
    socket.on('send_message', function (data) {
      io.emit('receive_message', data);
    });
    socket.on('disconnect', function () {
      console.log('[Chat] Disconnected:', socket.id);
    });
  });
};
module.exports = { handleChat };
