import Joi from 'joi'
import { EMAIL_RULE_MESSAGE, EMAIL_RULE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { DB_GET } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

// Define Collection (name & schema)
const COMMENT_COLLECTION_NAME = 'comments'
const COMMENT_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  cardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE).required(),
  userAvatar: Joi.string(),
  userDisplayName: Joi.string().required(),
  content: Joi.string().required(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(Date.now),
  _destroy: Joi.boolean().default(false)
})

const validBeforeCreate = async (data) => {
  return await COMMENT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validBeforeCreate(data)

    const createdComment = await DB_GET().collection(COMMENT_COLLECTION_NAME).insertOne({
      ...validData,
      cardId: new ObjectId(validData.cardId),
      boardId: new ObjectId(validData.boardId),
      userId: new ObjectId(validData.userId)
    })
    return createdComment
  } catch (error) {
    // Handle error
    throw new Error(error)
  }
}

const getCommentById = async (id) => {
  try {
    const comment = await DB_GET().collection(COMMENT_COLLECTION_NAME).findOne({ _id: new ObjectId(id) },
      {
        projection: {
          boardId: 0,
          userId: 0,
          _destroy: 0
        }
      })
    return comment
  } catch (error) {
    throw new Error(error)
  }
}

const UNCHANGE_FIELDS = ['_id', 'createdAt', 'boardId', 'cardId', 'userId', 'userEmail']

const update = async (commentId, updateData) => {
  try {
    Object.keys(updateData).forEach((key) => {
      if (UNCHANGE_FIELDS.includes(key)) {
        delete updateData[key]
      }
    })
    updateData.updatedAt = Date.now()

    const updatedComment = await DB_GET().collection(COMMENT_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(commentId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return updatedComment
  } catch (error) {
    throw new Error(error)
  }
}

const deleteCommentById = async (commentId) => {
  try {
    const deletedComment = await DB_GET().collection(COMMENT_COLLECTION_NAME).findOneAndDelete({ _id: new ObjectId(commentId) })
    return deletedComment
  } catch (error) {
    throw new Error(error)
  }
}

const deleteManyByColumnId = async (columnId) => {
  try {
    // Lấy tất cả cardIds thuộc columnId này
    const cardIds = await DB_GET()
      .collection('cards')
      .find({ columnId: new ObjectId(columnId) }, { projection: { _id: 1 } })
      .toArray()
      .then(cards => cards.map(card => card._id))
    // Xóa tất cả comments có cardId nằm trong danh sách cardIds
    const result = await DB_GET().collection(COMMENT_COLLECTION_NAME).deleteMany({
      cardId: { $in: cardIds }
    })

    return result
  } catch (error) {
    throw new Error(error)
  }
}


export const commentModel = {
  COMMENT_COLLECTION_NAME,
  COMMENT_COLLECTION_SCHEMA,
  createNew,
  getCommentById,
  update,
  deleteCommentById,
  deleteManyByColumnId
}