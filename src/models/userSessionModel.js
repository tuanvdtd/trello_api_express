import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { DB_GET } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const userSessions_COLLECTION_NAME = 'userSessions'
const userSessions_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  device_id: Joi.string().required(),
  // last_login: Joi.date().timestamp('javascript').default(Date.now),
  is_2fa_verified: Joi.boolean().default(false)
})

const validBeforeCreate = async (data) => {
  return await userSessions_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validBeforeCreate(data)

    const result = await DB_GET().collection(userSessions_COLLECTION_NAME).insertOne({
      ...validData,
      userId: new ObjectId(data.userId)
    })
    return result
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

export const userSessionModel = {
  userSessions_COLLECTION_NAME,
  userSessions_COLLECTION_SCHEMA,
  createNew,
  deleteSessionByDeviceId,
  getSessionByUserId
}