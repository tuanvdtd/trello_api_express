import { slugify } from '~/utils/fomatter'
import { BoardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'

const createNew = async (userId, resBody) => {
  try {
    const newBoard = {
      ...resBody,
      slug: slugify(resBody.title)
    }
    const createNew = await BoardModel.createNew(userId, newBoard)
    const result = await BoardModel.getBoardById(createNew.insertedId)
    return result

  } catch (error) {
    throw new Error(error)
  }
}

const getDetails = async (userId, boardId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const board = await BoardModel.getDetails(userId, boardId)
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
    throw error
  }
}

const update = async (boardId, resBody) => {
  try {
    const updatedData = {
      ...resBody,
      updatedAt: Date.now()
    }
    const updateResult = await BoardModel.update(boardId, updatedData)
    return updateResult
  } catch (error) {
    throw new Error(error)
  }
}

const moveCardToDiffColumn = async (resBody) => {
  try {
    //Xóa card khỏi column cũ
    await columnModel.update(resBody.preColumnId, {
      cardOrderIds: resBody.preCardOrderIds,
      updatedAt: Date.now()
    })
    //Thêm card vào column mới
    await columnModel.update(resBody.nextColumnId, {
      cardOrderIds: resBody.nextCardOrderIds,
      updatedAt: Date.now()
    })
    //Thay đổi columnId của card sau khi move
    await cardModel.update(resBody.cardId, {
      columnId: resBody.nextColumnId
    })
    return {
      message: 'Card moved successfully'
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemsPerPage, querySearchBoard) => {
  try {
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE


    const boards = await BoardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10), querySearchBoard)
    return boards
  } catch (error) {
    throw new Error(error)
  }
}


export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDiffColumn,
  getBoards
}