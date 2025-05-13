import { StatusCodes } from 'http-status-codes';
import express from 'express';
import { boardValidation } from '../../validations/boardValidation.js';
import { boardController } from '../../controllers/boardController.js';
const Router = express.Router();

Router.route("/")
    .get((req, res) => {
        res.status(StatusCodes.OK).json({
            status: `${StatusCodes.OK}`,
            message: "Get ",
        });
    })
    .post(boardValidation.createNew, boardController.createNew);

Router.route("/:id")
    .get(boardController.getDetail)
    .put()


export const boardRoute = Router;