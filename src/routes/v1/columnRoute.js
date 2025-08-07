import express from 'express'
import { columnValidation } from '../../validations/columnValidation.js'
import { columnController } from '../../controllers/columnController.js'
const Router = express.Router()

// eslint-disable-next-line quotes
Router.route("/")
  .post(columnValidation.createNew, columnController.createNew)

Router.route('/:id')
  .put(columnValidation.update, columnController.update)

export const columnRoute = Router
