
export const updateCardSocket = (socket) => {
  // console.log('a user connected: ', socket.id)
  // Join room khi user mở board
  socket.on('Fe_JoinBoard', (boardId) => {
    socket.join(boardId)
    // console.log(`User ${socket.id} joined board ${boardId}`)
  })
  socket.on('Fe_LeaveBoard', (boardId) => {
    socket.leave(boardId)
    // console.log(`User ${socket.id} left board ${boardId}`)
  })
  // lắng nghe sự kiện emit của bên fe gửi qua, phải trùng tên emit bên fe
  socket.on('Fe_UpdateCard', (cardData) => {
    // broadcast emit ngược lại dữ liệu mà client gửi lên cho mọi client bên fe khác người dùng mà vừa gửi từ fe qua be
    // socket.broadcast.emit('Be_UpdateCard', cardData)
    // Emit tới tất cả users trong cùng board, trừ người gửi
    socket.to(cardData.boardId).emit('Be_UpdateCard', cardData)
  })
}