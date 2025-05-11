import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';

const createNew = async (req, res, next) => {
    const boardSchema = Joi.object({
        title: Joi.string().required().min(3).max(50).trim().strict(),
        description: Joi.string().required().min(3).max(250).trim().strict()
    })
    try {
        await boardSchema.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        console.log(error);
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
            status: `${StatusCodes.UNPROCESSABLE_ENTITY}`,
            errors: new Error(error).message,
        });
    }
}

export const boardValidation = {
    createNew
}
