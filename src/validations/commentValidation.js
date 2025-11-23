import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
// import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const commentSchema = Joi.object({
    boardId: Joi.string().required(),
    cardId: Joi.string().required(),
    content: Joi.string().required()
  })
  try {
    await commentSchema.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
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

const updateComment = async (req, res, next) => {
  const commentSchema = Joi.object({
    content: Joi.string().required()
  })
  try {
    // console.log(req.body)
    await commentSchema.validateAsync(req.body, { abortEarly: false })
    next()
  }
  catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const commentValidation = {
  createNew,
  updateComment
}

