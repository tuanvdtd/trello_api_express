import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { columnService } from '~/services/columnService'

const createNew = async (req, res, next) => {
  try {
    // throw new Error("Error from Controllers");
    const createdColumn = await columnService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdColumn)

  }
  catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
  }
}

const update = async (req, res, next) => {
  try {
    const columnId = req.params.id
    const column = await columnService.update(columnId, req.body)
    res.status(StatusCodes.OK).json(column)
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
  }
}

const deleteColumn = async (req, res, next) => {
  try {
    const columnId = req.params.id
    const column = await columnService.deleteColumn(columnId)
    res.status(StatusCodes.OK).json(column)
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
  }
}

export const columnController = {
  createNew,
  update,
  deleteColumn
}
