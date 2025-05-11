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
    await mongoClient.connect();
    dbInstance = mongoClient.db(env.DATABASE_NAME)
}

export const DB_GET = () => {
    if (!dbInstance) {
        throw new Error('Database must be connected berfore using');
    } else return dbInstance
}

export const DB_CLOSE = async () => {
    await mongoClient.close()
}
