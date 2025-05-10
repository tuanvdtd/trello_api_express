import { StatusCodes } from 'http-status-codes';
import express from 'express';

const Router = express.Router();

Router.route("/")
    .get((req, res) => {
        res.status(StatusCodes.OK).json({
            status: `${StatusCodes.OK}`,
            message: "Get ",
        });
    })
    .post((req, res) => {
        res.status(StatusCodes.CREATED).json({
            status: `${StatusCodes.CREATED}`,
            message: "Post ",
        });
    })

export const boardRoute = Router;