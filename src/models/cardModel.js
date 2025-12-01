import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { DB_GET } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { CARD_MEMBER_ACTIONS } from '~/utils/constants'

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  cover: Joi.string().default(null),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  commentOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  // comments: Joi.array().items({
  //   userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  //   userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  //   userAvatar: Joi.string(),
  //   userDisplayName: Joi.string(),
  //   content: Joi.string(),
  //   commentedAt:Joi.date().timestamp()
  // }).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  dueDate: Joi.date().timestamp('javascript').optional().allow(null),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validBeforeCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validBeforeCreate(data)

    const createdCard = await DB_GET().collection(CARD_COLLECTION_NAME).insertOne({
      ...validData,
      columnId: new ObjectId(validData.columnId),
      boardId: new ObjectId(validData.boardId)
    })
    return createdCard
  } catch (error) {
    // Handle error
    throw new Error(error)
  }
}

const getCardById = async (id) => {
  try {
    const card = await DB_GET().collection(CARD_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return card
  } catch (error) {
    throw new Error(error)
  }
}

const UNCHANGE_FIELDS = ['_id', 'createdAt', 'boardId']

const update = async (cardId, updateData) => {
  try {
    Object.keys(updateData).forEach((key) => {
      if (UNCHANGE_FIELDS.includes(key)) {
        delete updateData[key]
      }
    })
    if (updateData.columnId) {
      updateData.columnId = new ObjectId(updateData.columnId)
    }
    const updateResult = await DB_GET().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return updateResult
  } catch (error) {
    throw new Error(error)
  }
}

const deleteCardsByColumnId = async (columnId) => {
  try {
    const result = await DB_GET().collection(CARD_COLLECTION_NAME).deleteMany({ columnId: new ObjectId(columnId) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}


const updateCardMembers = async (cardId, updateMemberCardData) => {
  let actionUpdateMemberCard = {}
  if (updateMemberCardData.action === CARD_MEMBER_ACTIONS.ADD) {
    actionUpdateMemberCard = { $push: { memberIds: new ObjectId(updateMemberCardData.userId) } }
  } else if (updateMemberCardData.action === CARD_MEMBER_ACTIONS.REMOVE) {
    actionUpdateMemberCard = { $pull: { memberIds: new ObjectId(updateMemberCardData.userId) } }
  }

  try {
    const updateResult = await DB_GET().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      actionUpdateMemberCard,
      { returnDocument: 'after' }
    )
    return updateResult
  } catch (error) {
    throw new Error(error)
  }
}

// Thêm columnId vào mảng commentOrderIds của card
const pushCommentIds = async (comment) => {
  try {
    const updateResult = await DB_GET().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(comment.cardId) },
      { $push: { commentOrderIds: { $each: [new ObjectId(comment._id)], $position: 0 } } },
      { returnDocument: 'after' }
    )
    return updateResult
  } catch (error) {
    throw new Error(error)
  }
}

// Xóa commentId khỏi mảng commentOrderIds của bảng card
const pullCommentIds = async (comment) => {
  try {
    const updateResult = await DB_GET().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(comment.cardId) },
      { $pull: { commentOrderIds: new ObjectId(comment._id) } },
      { returnDocument: 'after' }
    )
    return updateResult
  } catch (error) {
    throw new Error(error)
  }
}

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  getCardById,
  update,
  deleteCardsByColumnId,
  pushCommentIds,
  pullCommentIds,
  updateCardMembers
}