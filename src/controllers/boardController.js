import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
  try {
    // throw new Error("Error from Controllers");
    const userId = req.jwtDecoded._id
    // console.log('req.body', req.body)
    const createdBoard = await boardService.createNew(userId, req.body)
    res.status(StatusCodes.CREATED).json(createdBoard)

  }
  catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
  }
}
const getDetails = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const boardId = req.params.id
    const board = await boardService.getDetails(userId, boardId)
    res.status(StatusCodes.OK).json(board)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id
    // console.log('boardId', boardId)
    // console.log('req.body', req.body)
    // console.log('file', req.file)
    const backgroundFile = req.file
    const board = await boardService.update(boardId, req.body, backgroundFile)
    res.status(StatusCodes.OK).json(board)
  } catch (error) {
    next(error)
  }
}

const moveCardToDiffColumn = async (req, res, next) => {
  try {
    const board = await boardService.moveCardToDiffColumn(req.body)
    res.status(StatusCodes.OK).json(board)
  } catch (error) {
    next(error)
  }
}

const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { page, itemsPerPage, q } = req.query
    const querySearchBoard = q
    // console.log('querySearchBoard', querySearchBoard)
    const boards = await boardService.getBoards(userId, page, itemsPerPage, querySearchBoard)
    res.status(StatusCodes.OK).json(boards)
  } catch (error) {
    next(error)
  }
}


export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDiffColumn,
  getBoards
}
