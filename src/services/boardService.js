import { slugify } from "~/utils/fomatter";

const createNew = async (resBody) => {
    try {
        const newBoard = {
            ...resBody,
            slug: slugify(resBody.title),
        }
        return newBoard;

    } catch (error) {
        throw new Error(error);
    }
}

export const boardService = {
    createNew
}