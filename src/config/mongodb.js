/* eslint-disable indent */
const MOGODB_URI = 'mongodb+srv://tuanvdtd:qgjxQqJLUbKz5jvz@cluster0-tuandt.vg1kdkv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0-TuanDT'
const DATABASE_NAME = 'express-api-database'

import { MongoClient, ServerApiVersion } from 'mongodb'

let dbInstance = null
const mongoClient = new MongoClient(MOGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
})

export const DB_CONNECT = async () => {
    await mongoClient.connect();
    dbInstance = mongoClient.db(DATABASE_NAME)
}

export const DB_GET = () => {
    if (!dbInstance) {
        throw new Error('Database must be connected berfore using');
    } else return dbInstance
}

export const DB_CLOSE = async () => {
    await mongoClient.close()
}
