import express from 'express'
import { inviteUserValidation } from '~/validations/inviteUserValidator'
import { inviteUserController } from '~/controllers/inviteUserController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/board')
  .post(authMiddleware.isAuthorized, inviteUserValidation.createNewInvitation, inviteUserController.createNewInvitation)

Router.route('/')
  .get(authMiddleware.isAuthorized, inviteUserController.getInvitations)

Router.route('/board/:invitationId')
  .put(authMiddleware.isAuthorized, inviteUserController.updateInvitationStatus)

export const inviteUserRoute = Router