import { columnModel } from '~/models/columnModel'
import { BoardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'

const createNew = async (resBody) => {
  try {
    const newColumn = {
      ...resBody
    }
    const createNew = await columnModel.createNew(newColumn)
    const result = await columnModel.getColumnById(createNew.insertedId)

    if (result) {
      result.cards = []
      await BoardModel.pushColumnIds(result)
    }
    return result

  } catch (error) {
    throw new Error(error)
  }
}

const update = async (columnId, resBody) => {
  try {
    const updatedData = {
      ...resBody,
      updatedAt: Date.now()
    }
    const updateResult = await columnModel.update(columnId, updatedData)
    return updateResult
  } catch (error) {
    throw new Error(error)
  }
}

const deleteColumn = async (columnId) => {
  try {
    // Xóa column khỏi bảng DB columns
    await columnModel.deleteOneById(columnId)
    // Xóa card khỏi bảng DB cards
    await cardModel.deleteCardsByColumnId(columnId)
    return { message: 'Column deleted successfully' }
  } catch (error) {
    throw new Error(error)
  }
}

export const columnService = {
  createNew,
  update,
  deleteColumn
}