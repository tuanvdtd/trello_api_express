import { StatusCodes } from 'http-status-codes'
import express from 'express'
import { boardValidation } from '../../validations/boardValidation.js'
import { boardController } from '../../controllers/boardController.js'
const Router = express.Router()

// eslint-disable-next-line quotes
Router.route("/")
  .get((req, res) => {
    res.status(StatusCodes.OK).json({
      status: `${StatusCodes.OK}`,
      message: 'Get'
    })
  })
  .post(boardValidation.createNew, boardController.createNew)

Router.route('/:id')
  .get(boardController.getDetails)
  .put(boardValidation.update, boardController.update)

export const boardRoute = Router
