/* eslint-disable no-console */
/* eslint-disable indent */

import express from 'express'
import { DB_CONNECT, DB_GET, DB_CLOSE } from './config/mongodb'
import exitHook from 'async-exit-hook'

const START_SERVER = () => {
  const app = express()
  // process.stdin.resume()
  const hostname = 'localhost'
  const port = 8017

  app.get('/', async (req, res) => {
    console.log(await DB_GET().listCollections().toArray())
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello Tuan, I am running at http://${hostname}:${port}/`)
  })

  exitHook(async () => {
    console.log('Closing database connection...')
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