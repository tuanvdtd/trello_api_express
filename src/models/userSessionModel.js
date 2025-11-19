import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { DB_GET } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

const userSessions_COLLECTION_NAME = 'userSessions'
const userSessions_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  device_id: Joi.string().required(),
  sessionId: Joi.string().required(),
  is_2fa_verified: Joi.boolean().default(false),
  expiresAt: Joi.date().timestamp('javascript').required()
})

const validBeforeCreate = async (data) => {
  return await userSessions_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    // Tự động generate sessionId nếu không có
    const sessionId = data.sessionId || uuidv4()
    // Mặc định session hết hạn sau 14 ngày (hoặc lấy từ env)
    const expiresAt = data.expiresAt || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

    const validData = await validBeforeCreate({
      ...data,
      sessionId,
      expiresAt
    })

    const result = await DB_GET().collection(userSessions_COLLECTION_NAME).insertOne({
      ...validData,
      userId: new ObjectId(data.userId),
      createdAt: new Date()
    })
    return { ...result, sessionId }
  } catch (error) {
    // Handle error
    throw new Error(error)
  }
}

const getSessionByUserId = async (id, devide) => {
  try {
    const session = await DB_GET().collection(userSessions_COLLECTION_NAME).findOne({ userId: new ObjectId(id), device_id: devide })
    return session
  } catch (error) {
    throw new Error(error)
  }
}

const deleteSessionByDeviceId = async (userId, deviceId) => {
  try {
    const result = await DB_GET().collection(userSessions_COLLECTION_NAME).deleteMany({ userId: new ObjectId(userId), device_id: deviceId })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteById = async (sessionId) => {
  try {
    const result = await DB_GET().collection(userSessions_COLLECTION_NAME).deleteOne({ sessionId })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const updateByUserDevice = async (userId, deviceId, update) => {
  try {
    const result = await DB_GET().collection(userSessions_COLLECTION_NAME).updateOne(
      { userId: new ObjectId(userId), device_id: deviceId },
      { $set: update }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const userSessionModel = {
  userSessions_COLLECTION_NAME,
  userSessions_COLLECTION_SCHEMA,
  createNew,
  deleteSessionByDeviceId,
  getSessionByUserId,
  deleteById
  ,
  updateByUserDevice
}