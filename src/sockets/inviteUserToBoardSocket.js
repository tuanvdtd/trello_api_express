
export const inviteUserToBoardSocket = (socket) => {
  // console.log('a user connected: ', socket.id)
  // lắng nghe sự kiện emit của bên fe gửi qua, phải trùng tên emit bên fe
  socket.on('Fe_InviteUserToBoard', (invitation) => {
    // broadcast emit ngược lại dữ liệu mà client gửi lên cho mọi client bên fe khác người dùng mà vừa gửi từ fe qua be
    socket.broadcast.emit('Be_InviteUserToBoard', invitation)
  })
}