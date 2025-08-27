import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
// import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNewInvitation = async (req, res, next) => {
  const inviteUserSchema = Joi.object({
    boardId: Joi.string().required(),
    inviteeEmail: Joi.string().required()
  })
  try {
    await inviteUserSchema.validateAsync(req.body, { abortEarly: false })
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

export const inviteUserValidation = {
  createNewInvitation
}

