import Joi from 'joi'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'
import { DB_GET } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

// const USER_ROLES = {
//   ADMIN: 'admin',
//   CLIENT: 'client'
// }

// Define Collection (name & schema)
const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required(),
  //
  username: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  // role: Joi.string().valid(USER_ROLES.ADMIN, USER_ROLES.CLIENT).default(USER_ROLES.CLIENT),

  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),
  authProvider: Joi.string().valid('local').default('local'),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
  require_2fa: Joi.boolean().default(false)

})

const SOCIAL_USER_SCHEMA = Joi.object({
  email: Joi.string().email().required(),
  // KHÔNG có password field
  username: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  // role: Joi.string().valid(USER_ROLES.ADMIN, USER_ROLES.CLIENT).default(USER_ROLES.CLIENT),
  isActive: Joi.boolean().default(true), // Auto-verified
  authProvider: Joi.string().valid('google', 'auth0').required(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
  require_2fa: Joi.boolean().default(false)
})

const UNCHANGE_FIELDS = ['_id', 'email', 'username', 'createdAt']

const validBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  // try {
  //   const validData = await validBeforeCreate(data)

  //   const createdUser = await DB_GET().collection(USER_COLLECTION_NAME).insertOne(validData)
  //   return createdUser
  // } catch (error) {
  //   // Handle error
  //   throw new Error(error)
  // }
  try {
    let validData
    // Chọn schema phù hợp
    if (data.authProvider === 'local') {
      validData = await validBeforeCreate(data)
      // Tự động set isActive = false cho tài khoản mới
      validData.expiresAt = new Date(Date.now() + 60*1000) // 1 minutes
    } else {
      validData = await SOCIAL_USER_SCHEMA.validateAsync(data, { abortEarly: false })
    }

    const result = await DB_GET().collection(USER_COLLECTION_NAME).insertOne(validData)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const user = await DB_GET().collection(USER_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return user
  } catch (error) {
    throw new Error(error)
  }
}

const findOneByEmail = async (email) => {
  try {
    const user = await DB_GET().collection(USER_COLLECTION_NAME).findOne({ email: email })
    return user
  } catch (error) {
    throw new Error(error)
  }
}


const update = async (userId, updateData) => {
  try {
    Object.keys(updateData).forEach((key) => {
      if (UNCHANGE_FIELDS.includes(key)) {
        delete updateData[key]
      }
    })
    const updateResult = await DB_GET().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return updateResult
  } catch (error) {
    throw new Error(error)
  }
}

const updateUserActive = async (userId, updateData) => {
  try {
    Object.keys(updateData).forEach((key) => {
      if (UNCHANGE_FIELDS.includes(key)) {
        delete updateData[key]
      }
    })
    const updateResult = await DB_GET().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: updateData,
        $unset: { expiresAt: '' } // Xóa trường expiresAt sau khi kích hoạt để TTL không xóa user
      },
      { returnDocument: 'after' }
    )
    return updateResult
  } catch (error) {
    throw new Error(error)
  }
}


export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findOneByEmail,
  update,
  updateUserActive
}