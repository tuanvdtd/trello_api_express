import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';
const createNew = (req, res, next) => {
    try {
        // throw new Error("Error from Controllers");
        res.status(StatusCodes.CREATED).json({
            status: `${StatusCodes.CREATED}`,
            message: "Post from Controllers",
        });
    }
    catch (error) {
        next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message));
    }
}

export const boardController = {
    createNew
}
