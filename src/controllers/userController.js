import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'
import ms from 'ms'
import ApiError from '~/utils/ApiError'
import { userSessionModel } from '~/models/userSessionModel'

const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdUser)

  }
  catch (error) {
    next(error)
  }
}

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body)
    res.status(StatusCodes.OK).json(result)

  }
  catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)

    //
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.status(StatusCodes.OK).json(result)

  }
  catch (error) {
    next(error)
  }
}

const loginGoogle = async (req, res, next) => {
  try {
    const device = req.headers['user-agent'] || 'Unknown device'
    const resBody = req.body
    // console.log('resBody:', resBody)
    const result = await userService.loginGoogle(resBody, device)

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.status(StatusCodes.OK).json(result)
    // F24GQttruQbBeJnbNbHwI9NgHnQe7rhN
    // E0R_mzPajFHGwmiy9l3vSF46yaCMwdNr-CQY53zUKqcZ0HtcdFL-cxQe3b1Zv304

  }
  catch (error) {
    next(error)
  }
}

const logout = async (req, res, next) => {
  try {
    const device = req.headers['user-agent'] || 'Unknown device'
    const userId = req.jwtDecoded._id
    await userSessionModel.deleteSessionByDeviceId(userId, device)
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.status(StatusCodes.OK).json({ message: 'Logged out successfully' })
  }
  catch (error) {
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken)

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.status(StatusCodes.OK).json(result)

  }
  catch (error) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'Log in again to refresh your session'))
  }
}

const update = async (req, res, next) => {
  try {
    // Biến jwtDecoded chứa thông tin người dùng đã xác thực sau khi đi qua authMiddleware.isAuthorized
    const userId = req.jwtDecoded._id
    const userAvatarFile = req.file
    // console.log('userAvatarFile:', userAvatarFile)
    const updatedUser = await userService.update(userId, userAvatarFile, req.body)
    res.status(StatusCodes.OK).json(updatedUser)
  }
  catch (error) {
    next(error)
  }
}

const get2FA_QRCode = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const result = await userService.get2FA_QRCode(userId)
    res.status(StatusCodes.OK).json({ qrcode: result })
  }
  catch (error) {
    next(error)
  }
}

const setup2FA = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const device = req.headers['user-agent'] || 'Unknown device'
    const result = await userService.setup2FA(userId, req.body, device)
    res.status(StatusCodes.OK).json(result)
  }
  catch (error) {
    next(error)
  }
}
const verify2FA = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const device = req.headers['user-agent'] || 'Unknown device'
    const result = await userService.verify2FA(userId, req.body, device)
    res.status(StatusCodes.OK).json(result)
  }
  catch (error) {
    next(error)
  }
}
const disable2FA = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const result = await userService.disable2FA(userId)
    res.status(StatusCodes.OK).json(result)
  }
  catch (error) {
    next(error)
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    // console.log('email', email)
    const result = await userService.forgotPassword(email)
    res.status(StatusCodes.OK).json(result)
  }
  catch (error) {
    next(error)
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const { email, token, password } = req.body
    // console.log('email', email)
    // console.log('token', token)
    // console.log('password', password)
    const result = await userService.resetPassword(email, token, password)
    res.status(StatusCodes.OK).json(result)
  }
  catch (error) {
    next(error)
  }
}

export const userController = {
  createNew,
  verifyAccount,
  login,
  loginGoogle,
  logout,
  refreshToken,
  update,
  get2FA_QRCode,
  setup2FA,
  verify2FA,
  disable2FA,
  forgotPassword,
  resetPassword
}
