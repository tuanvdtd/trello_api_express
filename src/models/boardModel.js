import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { DB_GET } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { BOARD_TYPE } from '~/utils/constants'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'
import { userModel } from './userModel'
import { pagingSkipValue } from '~/utils/algorithms'
import { commentModel } from './commentModel'

const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(250).trim().strict(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

  // Danh sách các thành viên trong board
  memberIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  // Danh sách các chủ sở hữu của board
  ownerIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

  _destroy: Joi.boolean().default(false),
  background: Joi.object({
    backgroundType: Joi.string().valid('image', 'gradient', 'color').required(),
    backgroundUrl: Joi.string().required()
  }).optional(),
  type: Joi.string().valid(BOARD_TYPE.PUBLIC, BOARD_TYPE.PRIVATE).required()
})

const UNCHANGE_FIELDS = ['_id', 'createdAt']

const validBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (userId, data) => {
  try {
    const validData = await validBeforeCreate(data)
    const createdBoard = await DB_GET().collection(BOARD_COLLECTION_NAME).insertOne({
      ...validData,
      ownerIds: [new ObjectId(userId)]
    })
    return createdBoard
  } catch (error) {
    // Handle error
    throw new Error(error)
  }
}

const getBoardById = async (id) => {
  try {
    const board = await DB_GET().collection(BOARD_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return board
  } catch (error) {
    throw new Error(error)
  }
}

const getDetails = async (userId, boardId) => {
  const queryConditions = [
    { _id: new ObjectId(boardId) },
    // Dk1 board chua xoa
    { _destroy: false },
    // Dk2 board thuoc ve userId (member or owner)
    { $or: [
      { ownerIds: { $all: [new ObjectId(userId)] } },
      { memberIds: { $all: [new ObjectId(userId)] } }
    ] }
  ]
  try {
    // const board = await DB_GET().collection(BOARD_COLLECTION_NAME).findOne({ _id: new ObjectId(boardId) })
    const board = await DB_GET().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      { $lookup: {
        from: columnModel.COLUMN_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'boardId',
        as: 'columns'
      } },
      { $lookup: {
        from: cardModel.CARD_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'boardId',
        as: 'cards'
      } },
      { $lookup: {
        from: commentModel.COMMENT_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'boardId',
        as: 'comments',
        pipeline: [
          { $project: {
            boardId: 0,
            _destroy: 0 } }
        ]
      } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'ownerIds',
        foreignField: '_id',
        as: 'owners',
        // không muốn lấy các trường này từ bảng user gắn vào mảng owners thì đặt bằng 0
        pipeline: [
          { $project: { 'password': 0, 'verifyToken': 0 } }
        ]
      } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'memberIds',
        foreignField: '_id',
        as: 'members',
        pipeline: [
          { $project: { 'password': 0, 'verifyToken': 0 } }
        ]
      } }
    ]).toArray()
    return board[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

// Thêm columnId vào mảng columnOrderIds của bảng board
const pushColumnIds = async (column) => {
  try {
    const updateResult = await DB_GET().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $push: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after' }
    )
    return updateResult
  } catch (error) {
    throw new Error(error)
  }
}

// Xóa columnId khỏi mảng columnOrderIds của bảng board
const pullColumnIds = async (column) => {
  try {
    const updateResult = await DB_GET().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $pull: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after' }
    )
    return updateResult
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
    const updateResult = await DB_GET().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return updateResult
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemsPerPage, querySearchBoard) => {
  try {
    //
    const queryConditions = [
      // Dk1 board chua xoa
      { _destroy: false },
      // Dk2 board thuoc ve userId (member or owner)
      { $or: [
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } }
      ] }
    ]
    if (querySearchBoard) {
      Object.keys(querySearchBoard).forEach((field) => {
        // Cho phép tìm kiếm theo nhiều trường, sử dụng regex của mogodb, và kh phân biệt chữ hoa chữ thường
        queryConditions.push({ [field]: { $regex: new RegExp(querySearchBoard[field], 'i') } })

        // Phân biệt chữ hoa chữ thường
        // queryConditions.push({ [field]: { $regex: querySearchBoard[field] } })
      })
    }

    // Tạo pipeline cho queryBoards
    const queryBoardsPipeline = []
    // Chỉ thêm skip và limit nếu không có querySearchBoard
    if (!querySearchBoard) {
      queryBoardsPipeline.push(
        { $skip: pagingSkipValue(page, itemsPerPage) },
        { $limit: itemsPerPage }
      )
    }
    // Thêm các lookup operations
    queryBoardsPipeline.push(
      // Lookup owners (chỉ lấy displayName và avatar)
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'ownerIds',
        foreignField: '_id',
        as: 'owners',
        pipeline: [
          { $project: { displayName: 1, avatar: 1 } }
        ]
      } },

      // Lookup members (chỉ lấy displayName và avatar)
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'memberIds',
        foreignField: '_id',
        as: 'members',
        pipeline: [
          { $project: { displayName: 1, avatar: 1 } }
        ]
      } },

      // Merge owners into members
      { $addFields: {
        members: { $setUnion: ['$owners', '$members'] }
      } },

      // Remove owners
      { $project: { owners: 0 } }
    )

    const query = await DB_GET().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      { $sort: { title : 1 } },
      // Xử lí nhiều luồng
      { $facet: {
        // 1 query boards
        'queryBoards': queryBoardsPipeline,
        // 2 query total count
        'queryCountTotalBoards': [
          { $count: 'totalBoards' }
        ]

      } }
    ], { collation: { locale: 'en' } }).toArray()
    const res = query[0]
    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryCountTotalBoards[0]?.totalBoards || 0
    }
  } catch (error) {
    throw new Error(error)
  }
}

const addMemberToBoard = async (boardId, userId) => {
  try {
    const updateResult = await DB_GET().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $push: { memberIds: new ObjectId(userId) } },
      { returnDocument: 'after' }
    )
    return updateResult
  } catch (error) {
    throw new Error(error)
  }
}

export const BoardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  getBoardById,
  getDetails,
  pushColumnIds,
  update,
  pullColumnIds,
  getBoards,
  addMemberToBoard
}

