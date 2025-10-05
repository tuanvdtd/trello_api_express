import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { DB_GET } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const twoFA_COLLECTION_NAME = '2faSecretKeys'
const twoFA_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  value: Joi.string()
})

const validBeforeCreate = async (data) => {
  return await twoFA_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validBeforeCreate(data)

    const result = await DB_GET().collection(twoFA_COLLECTION_NAME).insertOne({
      ...validData,
      userId: new ObjectId(data.userId)
    })
    return result
  } catch (error) {
    // Handle error
    throw new Error(error)
  }
}

const getSecretKeyByUserId = async (id) => {
  try {
    const twoFA = await DB_GET().collection(twoFA_COLLECTION_NAME).findOne({ userId: new ObjectId(id) })
    return twoFA
  } catch (error) {
    throw new Error(error)
  }
}

export const twoFASecretKeyModel = {
  twoFA_COLLECTION_NAME,
  twoFA_COLLECTION_SCHEMA,
  createNew,
  getSecretKeyByUserId
}