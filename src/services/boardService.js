import { slugify } from "~/utils/fomatter";
import { BoardModel } from "~/models/boardModel"
const createNew = async (resBody) => {
    try {
        const newBoard = {
            ...resBody,
            slug: slugify(resBody.title),
        }
        const createNew = await BoardModel.createNew(newBoard);
        const result = await BoardModel.getBoardById(createNew.insertedId);
        return result;

    } catch (error) {
        throw new Error(error);
    }
}

export const boardService = {
    createNew
}