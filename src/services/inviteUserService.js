import { userModel } from '~/models/userModel'
import { BoardModel } from '~/models/boardModel'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { invitationModel } from '~/models/invitationModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { pickUser } from '~/utils/fomatter'

const createNewInvitation = async (inviterId, resBody) => {
  try {
    // Find users and board
    const inviter = await userModel.findOneById(inviterId)
    const invitee = await userModel.findOneByEmail(resBody.inviteeEmail)
    const board = await BoardModel.getBoardById(resBody.boardId)

    if (!inviter) throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter user not found')
    if (!invitee) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitee user not found')
    if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')

    const newInvitation = {
      inviterId: inviterId,
      inviteeId: invitee._id.toString(),
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitation)
    const result = await invitationModel.getInvitationById(createdInvitation.insertedId)
    return {
      ...result,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }

  } catch (error) {
    throw new Error(error)
  }
}


export const inviteUserService = {
  createNewInvitation
}