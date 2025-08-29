import { StatusCodes } from 'http-status-codes'
// import ApiError from '~/utils/ApiError'
import { inviteUserService } from '~/services/inviteUserService'

const createNewInvitation = async (req, res, next) => {
  try {
    // throw new Error("Error from Controllers");
    const inviterId = req.jwtDecoded._id
    const result = await inviteUserService.createNewInvitation(inviterId, req.body)
    // console.log(inviterId)
    // console.log(req.body)
    res.status(StatusCodes.CREATED).json(result)

  }
  catch (error) {
    next(error)
  }
}

const getInvitations = async (req, res, next) => {
  try {
    // throw new Error("Error from Controllers");
    const inviteeId = req.jwtDecoded._id
    const result = await inviteUserService.getInvitations(inviteeId)
    // console.log(inviterId)
    // console.log(req.body)
    res.status(StatusCodes.OK).json(result)

  }
  catch (error) {
    next(error)
  }
}

const updateInvitationStatus = async (req, res, next) => {
  try {
    // throw new Error("Error from Controllers");
    const invitationId = req.params.invitationId
    const userId = req.jwtDecoded._id
    const { status } = req.body
    const result = await inviteUserService.updateInvitationStatus(invitationId, status, userId)
    // console.log(resBody)
    // console.log(status)
    res.status(StatusCodes.OK).json(result)

  }
  catch (error) {
    next(error)
  }
}


export const inviteUserController = {
  createNewInvitation,
  getInvitations,
  updateInvitationStatus
}
