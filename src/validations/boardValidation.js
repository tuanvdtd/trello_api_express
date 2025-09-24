import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPE } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const boardSchema = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().required().min(3).max(250).trim().strict(),
    type: Joi.string().valid(BOARD_TYPE.PUBLIC, BOARD_TYPE.PRIVATE).required()
    // template: Joi.string().valid('Kanban', 'Scrum', 'Extreme', 'Custom').optional() // Chỉ cho phép các template có sẵn
  })
  try {
    await boardSchema.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  }
  catch (error) {
    // next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, (error.massage)));
    // res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
    //     status: `${StatusCodes.UNPROCESSABLE_ENTITY}`,
    //     message: error.message,
    // });
    // next(error)
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const update = async (req, res, next) => {
  const boardSchema = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(250).trim().strict(),
    type: Joi.string().valid(BOARD_TYPE.PUBLIC, BOARD_TYPE.PRIVATE),
    columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
  })
  try {
    await boardSchema.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  }
  catch (error) {
    // next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, (error.massage)));
    // res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
    //     status: `${StatusCodes.UNPROCESSABLE_ENTITY}`,
    //     message: error.message,
    // });
    // next(error)
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const moveCardToDiffColumn = async (req, res, next) => {
  const boardSchema = Joi.object({
    cardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    preColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    nextColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    preCardOrderIds: Joi.array().required().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)),
    nextCardOrderIds: Joi.array().required().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
  })
  try {
    await boardSchema.validateAsync(req.body, { abortEarly: false })
    next()
  }
  catch (error) {
    // next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, (error.massage)));
    // res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
    //     status: `${StatusCodes.UNPROCESSABLE_ENTITY}`,
    //     message: error.message,
    // });
    // next(error)
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const boardValidation = {
  createNew,
  update,
  moveCardToDiffColumn
}

