/* eslint-disable indent */

import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment'
let dbInstance = null

const mongoClient = new MongoClient(env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
})

export const DB_CONNECT = async () => {
    await mongoClient.connect()
    dbInstance = mongoClient.db(env.DATABASE_NAME)
    // Tạo TTL index cho userSessions (xóa khi expiresAt <= now)
    try {
      await dbInstance.collection('userSessions')
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
      await dbInstance.collection('users')
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    } catch (err) {
      throw new Error('Failed to create TTL index for userSessions.expiresAt')
    }
}

export const DB_GET = () => {
    if (!dbInstance) {
        throw new Error('Database must be connected berfore using')
    } else return dbInstance
}

export const DB_CLOSE = async () => {
    await mongoClient.close()
}
