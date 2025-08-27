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

export const inviteUserController = {
  createNewInvitation
}
