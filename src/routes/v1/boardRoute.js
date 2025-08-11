import { StatusCodes } from 'http-status-codes'
import express from 'express'
import { boardValidation } from '../../validations/boardValidation'
import { boardController } from '../../controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
const Router = express.Router()

// eslint-disable-next-line quotes
Router.route("/")
  .get(authMiddleware.isAuthorized, (req, res) => {
    res.status(StatusCodes.OK).json({
      status: `${StatusCodes.OK}`,
      message: 'Get'
    })
  })
  .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew)

Router.route('/:id')
  .get(authMiddleware.isAuthorized, boardController.getDetails)
  .put(authMiddleware.isAuthorized, boardValidation.update, boardController.update)

Router.route('/supports/move_card')
  .put(authMiddleware.isAuthorized, boardValidation.moveCardToDiffColumn, boardController.moveCardToDiffColumn)

export const boardRoute = Router
