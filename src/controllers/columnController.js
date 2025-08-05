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

export const columnController = {
  createNew
}
