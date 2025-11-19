import express from 'express'
import { userValidation } from '~/validations/userValidation'
import { userController } from '~/controllers/userController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'

const Router = express.Router()

Router.route('/register')
  .post(userValidation.createNew, userController.createNew)

Router.route('/verify')
  .put(userValidation.verifyAccount, userController.verifyAccount)

Router.route('/login')
  .post(userValidation.login, userController.login)

Router.route('/login_google')
  .post(userController.loginGoogle)

Router.route('/logout')
  .delete(userController.logout)

Router.route('/refresh_token')
  .get(userController.refreshToken)

Router.route('/update')
  .put(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('avatar'),
    userValidation.update,
    userController.update
  )

Router.route('/get_2fa_qr_code')
  .get(authMiddleware.isAuthorized, userController.get2FA_QRCode)

Router.route('/setup_2fa')
  .post(authMiddleware.isAuthorized, userController.setup2FA)

Router.route('/verify_2fa')
  .put(authMiddleware.isAuthorized, userController.verify2FA)

Router.route('/disable_2fa')
  .put(authMiddleware.isAuthorized, userController.disable2FA)

Router.route('/forgot-password')
  .post(userController.forgotPassword)

Router.route('/reset-password')
  .post(userValidation.resetPassword, userController.resetPassword)

export const userRoute = Router