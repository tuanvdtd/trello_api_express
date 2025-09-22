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

  app.get('/', (req, res) => {
  const mode = env.BUILD_MODE === 'production' ? 'PRODUCTION' : 'DEVELOPMENT'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Trello API Server</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status { background: ${mode === 'PRODUCTION' ? '#4CAF50' : '#2196F3'}; color: white; padding: 10px 20px; border-radius: 5px; text-align: center; margin-bottom: 20px; }
        .info { background: #f9f9f9; padding: 15px; border-radius: 5px; }
        .info div { margin: 5px 0; }
        .label { font-weight: bold; display: inline-block; width: 120px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Trello API Server</h1>
        <div class="status">
          <h2>Status: Running (${mode})</h2>
        </div>
        <div class="info">
          <div><span class="label">Environment:</span> ${mode}</div>
          <div><span class="label">Started:</span> ${new Date().toLocaleString()}</div>
        </div>
      </div>
    </body>
    </html>
  `

  res.send(html)
})

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

  // Lắng nghe sự kiện kết nối socket
  if (env.BUILD_MODE === 'production') {
    server.listen(process.env.PORT, () => {
      console.log(`Hi ${env.AUTHOR},I am running in production mode at port: ${process.env.PORT}/`)
    })
  } else {
    server.listen(env.PORT, env.HOSTNAME, () => {
      // eslint-disable-next-line no-console
      console.log(`Hello ${env.AUTHOR}, I am running at http://${env.HOSTNAME}:${env.PORT}/`)
    })
  }


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