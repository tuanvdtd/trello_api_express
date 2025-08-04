import { slugify } from '~/utils/fomatter'
import { BoardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

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
    return board
  } catch (error) {
    throw new Error(error)
  }
}

export const boardService = {
  createNew,
  getDetails
}