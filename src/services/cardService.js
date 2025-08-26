
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { cloudinaryProvider } from '~/providers/cloudinaryProvider'

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
const update = async (cardId, resBody, cardCoverFile) => {
  try {
    const updateData = {
      ...resBody,
      updatedAt: Date.now()
    }
    let updatedData = { }
    if (cardCoverFile) {
      // upload lên cloundinary
      const cardCover = await cloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      // Lưu lại url avatar vào database
      updatedData = await cardModel.update(cardId, { cover: cardCover.secure_url })
    } else {
      // update các thông tin khác
      updatedData = await cardModel.update(cardId, updateData)
    }
    return updatedData
  } catch (error) {
    throw new Error(error)
  }
}

export const cardService = {
  createNew,
  update
}
