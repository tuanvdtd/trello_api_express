import { StatusCodes } from 'http-status-codes';

const createNew = (req, res, next) => {
    try {
        res.status(StatusCodes.CREATED).json({
            status: `${StatusCodes.CREATED}`,
            message: "Post from Controllers",
        });
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes.BAD_GATEWAY).json({
            status: `${StatusCodes.BAD_GATEWAY}`,
            errors: error.message,
        });
    }
}

export const boardController = {
    createNew
}
