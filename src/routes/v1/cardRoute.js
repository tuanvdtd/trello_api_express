import express from 'express'
import { cardValidation } from '../../validations/cardValidation.js'
import { cardController } from '../../controllers/cardController.js'
const Router = express.Router()

// eslint-disable-next-line quotes
Router.route("/")
  .post(cardValidation.createNew, cardController.createNew)

export const cardRoute = Router
