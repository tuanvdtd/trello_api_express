import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { DB_GET } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'

const INVITATION_COLLECTION_NAME = 'invitations'
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  inviteeId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  type: Joi.string().valid(...Object.values(INVITATION_TYPES)).required(),

  boardInvitation: Joi.object({
    boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
    status: Joi.string().valid(...Object.values(BOARD_INVITATION_STATUS)).required()
  }).optional(),

  _destroy: Joi.boolean().default(false),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

const UNCHANGE_FIELDS = ['_id', 'createdAt', 'inviteeId', 'inviterId', 'type']

const validBeforeCreate = async (data) => {
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNewBoardInvitation = async (data) => {
  try {
    const validData = await validBeforeCreate(data)

    // Sau khi validate xong thì chuyển các id sang ObjectId
    let newInvitationData = {
      ...validData,
      inviterId: new ObjectId(validData.inviterId),
      inviteeId: new ObjectId(validData.inviteeId)
    }
    // Nếu  đang mời vào board( nghĩa là có boardInvitation ) thì chuyển boardId sang ObjectId
    // if (validData.boardInvitation) {
    //   newInvitationData.boardInvitation.boardId = new ObjectId(validData.boardInvitation.boardId)
    // }

    if (validData.boardInvitation) {
      newInvitationData.boardInvitation = {
        ...validData.boardInvitation,
        boardId: new ObjectId(validData.boardInvitation.boardId)
      }
    }

    const createdInvitation = await DB_GET().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationData)
    return createdInvitation
  } catch (error) {
    // Handle error
    throw new Error(error)
  }
}

const getInvitationById = async (id) => {
  try {
    const invitation = await DB_GET().collection(INVITATION_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return invitation
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, updateData) => {
  try {
    Object.keys(updateData).forEach((key) => {
      if (UNCHANGE_FIELDS.includes(key)) {
        delete updateData[key]
      }
    })
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(_id => new ObjectId(_id))
    }
    const updateResult = await DB_GET().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return updateResult
  } catch (error) {
    throw new Error(error)
  }
}


export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  createNewBoardInvitation,
  getInvitationById,
  update
}

