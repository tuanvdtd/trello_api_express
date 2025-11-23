import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { commentController } from '~/controllers/commentController'
import { commentValidation } from '~/validations/commentValidation'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, commentValidation.createNew, commentController.createNew)

Router.route('/:id')
  .delete(authMiddleware.isAuthorized, commentController.deleteComment)
  .put(authMiddleware.isAuthorized, commentValidation.updateComment, commentController.updateComment)

export const commentRoute = Router