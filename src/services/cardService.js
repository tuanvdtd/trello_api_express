
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

const createNew = async (resBody) => {
  try {
    const newCard = {
      ...resBody
    }
    const createNew = await cardModel.createNew(newCard)
    const result = await cardModel.getCardById(createNew.insertedId)
    if (result) {
      await columnModel.pushCardIds(result)
    }
    return result

  } catch (error) {
    throw new Error(error)
  }
}

export const cardService = {
  createNew
}
