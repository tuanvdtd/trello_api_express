/* eslint-disable no-useless-catch */
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
    throw error
  }
}

const getInvitations = async (inviteeId) => {
  try {
    const result = await invitationModel.findInvitationsByInviteeId(inviteeId)
    const formattedResult = result.map((invitation) => {
      return {
        ...invitation,
        board: invitation.board[0] || {},
        inviter: invitation.inviter[0] || {},
        invitee: invitation.invitee[0] || {}
      }
    })
    return formattedResult
  } catch (error) {
    throw error
  }
}

const updateInvitationStatus = async (invitationId, resBody, userId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const invitation = await invitationModel.getInvitationById(invitationId)
    const board = await BoardModel.getBoardById(invitation.boardInvitation.boardId)

    if (!invitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found')
    if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    const memberIds = [...board.memberIds, ...board.ownerIds].toString()
    if (resBody === BOARD_INVITATION_STATUS.ACCEPTED && memberIds.includes(userId)) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member of this board')

    const updateData = {
      boardInvitation: {
        ...invitation.boardInvitation,
        status: resBody
      },
      updatedAt: Date.now()
    }
    // update status
    const updatedInvitation = await invitationModel.updateInvitationStatus(invitationId, updateData)

    // Thêm member vào board nếu chấp nhận
    if (resBody === BOARD_INVITATION_STATUS.ACCEPTED) {
      await BoardModel.addMemberToBoard(board._id.toString(), userId)
    }
    return updatedInvitation
  } catch (error) {
    // để cái này thì sẽ ra lỗi như trong try catch và không cần phải throw error cũng được
    throw error
  }
}

export const inviteUserService = {
  createNewInvitation,
  getInvitations,
  updateInvitationStatus
}