import express from 'express'
import { columnValidation } from '../../validations/columnValidation.js'
import { columnController } from '../../controllers/columnController.js'
const Router = express.Router()

// eslint-disable-next-line quotes
Router.route("/")
  .post(columnValidation.createNew, columnController.createNew)

export const columnRoute = Router
