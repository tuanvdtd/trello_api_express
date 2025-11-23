/* eslint-disable no-useless-catch */
import { commentModel } from '~/models/commentModel'
import { cardModel } from '~/models/cardModel'

const createNew = async (userInfo, resBody) => {
  try {
    //
    const data = {
      userId: userInfo._id,
      userEmail: userInfo.email,
      ...resBody
    }
    const createdComment = await commentModel.createNew(data)
    const result = await commentModel.getCommentById(createdComment.insertedId.toString())
    await cardModel.pushCommentIds(result)

    return result

  } catch (error) {
    throw error
  }
}

const deleteComment = async (commentId) => {
  try {
    const comment = await commentModel.deleteCommentById(commentId)
    await cardModel.pullCommentIds(comment)
    return comment
  } catch (error) {
    throw (error)
  }
}

const updateComment = async (commentId, content) => {
  try {
    const comment = await commentModel.getCommentById(commentId)
    if (!comment) throw new Error('Comment not found')
    const updatedData = {
      content: content,
      updatedAt: Date.now()
    }
    const updatedComment = await commentModel.update(commentId, updatedData)
    return updatedComment
  } catch (error) {
    throw error
  }
}

export const commentService = {
  createNew,
  updateComment,
  deleteComment
}