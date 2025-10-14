
export const boardUpdateSocket = (socket) => {
  // Join board room
  socket.on('Fe_JoinBoard', (boardId) => {
    socket.join(boardId)
    // console.log(`User ${socket.id} joined board ${boardId}`)
  })

  // Leave board room
  socket.on('Fe_LeaveBoard', (boardId) => {
    socket.leave(boardId)
    // console.log(`User ${socket.id} left board ${boardId}`)
  })

  socket.on('Fe_UpdateBoard', (data) => {
    // console.log('Card moved to different column:', data)
    socket.to(data._id).emit('Be_UpdateBoard', data)
  })
}