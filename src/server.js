/* eslint-disable no-console */
/* eslint-disable indent */
import express from 'express'
import { DB_CONNECT, DB_GET, DB_CLOSE } from './config/mongodb'
import exitHook from 'async-exit-hook'
import { env } from './config/environment'
import { Router_V1 } from "./routes/v1"
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'

const START_SERVER = () => {
  const app = express()
  // process.stdin.resume()
  app.use(express.json())
  app.use('/v1', Router_V1)
  app.use(errorHandlingMiddleware)

  app.listen(env.PORT, env.HOSTNAME, () => {
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