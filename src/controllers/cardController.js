import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { cardService } from '~/services/cardService'

const createNew = async (req, res, next) => {
  try {
    // throw new Error("Error from Controllers");
    const createdCard = await cardService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdCard)

  }
  catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
  }
}

const update = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const cardCoverFile = req.file
    const card = await cardService.update(cardId, req.body, cardCoverFile)
    res.status(StatusCodes.OK).json(card)
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
  }
}


export const cardController = {
  createNew,
  update
}
