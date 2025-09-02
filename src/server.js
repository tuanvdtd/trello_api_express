/* eslint-disable no-console */
/* eslint-disable indent */
import express from 'express'
import cors from 'cors'
import { corsOptions } from './config/cors'
import { DB_CONNECT, DB_CLOSE } from './config/mongodb'
import exitHook from 'async-exit-hook'
import { env } from './config/environment'
import { Router_V1 } from './routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import cookieParser from 'cookie-parser'
import socketIo from 'socket.io'
import http from 'http'
import { inviteUserToBoardSocket } from './sockets/inviteUserToBoardSocket'

const START_SERVER = () => {
  const app = express()

  app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
  })

  // process.stdin.resume()
  app.use(express.json())
  app.use(cookieParser())
  app.use(cors(corsOptions))

  app.use('/v1', Router_V1)
  app.use(errorHandlingMiddleware)

  // Tạo server mới để sử dụng socker.io
  const server = http.createServer(app)
  // Khởi tạo biến io với server và cors
  const io = socketIo(server, {
    cors: corsOptions
  })
  // eslint-disable-next-line no-unused-vars
  io.on('connection', (socket) => {
    inviteUserToBoardSocket(socket)
  })
  // if (env.BUILD_MODE === 'production') {
  //   server.listen(process.env.PORT, () => {
  //     console.log(`Production: Hi ${env.AUTHOR}, BE are running`)
  //   })
  // }

  server.listen(env.PORT, env.HOSTNAME, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello ${env.AUTHOR}, I am running at http://${env.HOSTNAME}:${env.PORT}/`)
  })

  exitHook(async () => {
    console.log('Shutting down database...')
    DB_CLOSE()
    console.log('Database connection closed')
  })
}

(async () => {
  try {
    await DB_CONNECT()
    START_SERVER()
  }
  catch (err) {
    console.error(err)
    process.exit(1)
  }

})()

// DB_CONNECT()
//   .then(() => {
//     console.log('Database connected successfully')
//   })
//   .then(() => {
//     START_SERVER()
//   })
//   .catch(err => {
//     // eslint-disable-next-line no-console
//     console.error(err)
//     process.exit(1)
//   })