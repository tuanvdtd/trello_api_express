import { slugify } from '~/utils/fomatter'
import { BoardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'

const createNew = async (resBody) => {
  try {
    const newBoard = {
      ...resBody,
      slug: slugify(resBody.title)
    }
    const createNew = await BoardModel.createNew(newBoard)
    const result = await BoardModel.getBoardById(createNew.insertedId)
    return result

  } catch (error) {
    throw new Error(error)
  }
}

const getDetails = async (boardId) => {
  try {
    const board = await BoardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Board with id ${boardId} not found`)
    }
    const boardClone = cloneDeep(board)
    boardClone.columns.forEach(column => {
      column.cards = boardClone.cards.filter(card => card.columnId.toString() === column._id.toString())
    })
    delete boardClone.cards

    return boardClone
  } catch (error) {
    throw new Error(error)
  }
}

export const boardService = {
  createNew,
  getDetails
}