import { StatusCodes } from 'http-status-codes'
import { commentService } from '~/services/commentService'

const createNew = async (req, res, next) => {
  try {
    // throw new Error("Error from Controllers");
    const userInfo = req.jwtDecoded
    const result = await commentService.createNew(userInfo, req.body)
    res.status(StatusCodes.CREATED).json(result)
  }
  catch (error) {
    next(error)
  }
}

const deleteComment = async (req, res, next) => {
  try {
    const commentId = req.params.id
    const result = await commentService.deleteComment(commentId)
    res.status(StatusCodes.OK).json(result)
  }
  catch (error) {
    next(error)
  }
}

const updateComment = async (req, res, next) => {
  try {
    const commentId = req.params.id
    const updatedData = req.body.content
    const result = await commentService.updateComment(commentId, updatedData)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}


export const commentController = {
  createNew,
  deleteComment,
  updateComment
}
