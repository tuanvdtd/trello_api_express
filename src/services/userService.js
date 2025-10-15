/* eslint-disable no-useless-catch */
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/fomatter'
// import { ResendProvider } from '~/providers/ResendProvider'
import { BrevoProvider } from '~/providers/BrevoProdiver'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import { cloudinaryProvider } from '~/providers/cloudinaryProvider'
import { authenticator } from 'otplib'
import qrcode from 'qrcode'
import { twoFASecretKeyModel } from '~/models/2faSecretKeyModel'
import { userSessionModel } from '~/models/userSessionModel'

const serviceName = '2FA-Trello (MERN)'

const createNew = async (userData) => {
  // Logic to create a new user
  try {
    // Kiểm tra xem email đã tồn tại hay chưa
    const existingUser = await userModel.findOneByEmail(userData.email)
    if (existingUser) {
      throw new ApiError( StatusCodes.CONFLICT, 'Email already exists!')
    }

    // Tạo data lưu vào database
    const nameFromEmail = userData.email.split('@')[0]

    const newUser = {
      email: userData.email,
      password: bcrypt.hashSync(userData.password, 8),
      username: nameFromEmail,
      authProvider: 'local',
      displayName: nameFromEmail, // Mặc định tên hiển thị là tên từ email
      verifyToken: uuidv4()
    }

    const createdUser = await userModel.createNew(newUser)
    const result = await userModel.findOneById(createdUser.insertedId)

    // Gửi email cho người dùng xác thực tài khoản
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${result.email}&token=${result.verifyToken}`
    const to = result.email
    const html = `
    <h1>Welcome!</h1>
    <h2>Thank you for joining us.</h2>
    <h3>Here is your verification link:</h3>
    <h3>${verificationLink}</h3>
    <h3>Sincerely!</h3>
    `
    // await ResendProvider.sendEmail({ to, subject, html })
    // Sử dụng Brevo để gửi email
    const customSubject = 'Trello MERN: Please verify your email before using our services!'
    // Gọi tới cái Provider gửi email
    await BrevoProvider.sendEmail(to, customSubject, html)

    // return trả về dữ liệu người dùng đã tạo
    return pickUser(result)

  } catch (error) {
    throw error
  }
}

const verifyAccount = async (resBody) => {
  try {
    //
    const existingUser = await userModel.findOneByEmail(resBody.email)
    if (!existingUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    if (existingUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account is already active!')
    }
    if (resBody.token !== existingUser.verifyToken) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Invalid verification token!')
    }

    // Ok
    const updateData = {
      isActive: true,
      verifyToken: null
    }
    const updatedUser = await userModel.update(existingUser._id, updateData)
    return pickUser(updatedUser)

  } catch (error) {
    throw error
  }
}

const login = async (resBody, device) => {
  try {
    //
    const existingUser = await userModel.findOneByEmail(resBody.email)
    if (!existingUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    if (!existingUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account is not active! Please verify your account first.')
    }
    // Nếu tài khoản là social login thì không thể đăng nhập bằng email/password
    if (existingUser.authProvider !== 'local') {
      throw new ApiError(StatusCodes.BAD_REQUEST, `This account was created with ${existingUser.authProvider}. Please use that login method.`)
    }
    // Kiểm tra mật khẩu
    if (!existingUser.password) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'This account does not have a password. Please use social login.')
    }
    if (!bcrypt.compareSync(resBody.password, existingUser.password)) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid password!')
    }
    // Ok thì tạo token đăng nhập để trả về cho fe
    // Thông tin sẽ đính kèm trong JWT Token gồm _id và email của user
    const userInfo = {
      _id: existingUser._id,
      email: existingUser.email
    }

    // Tạo ra 2 loại token, accessToken và refreshToken để trả về cho fe
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET,
      // 5 // 5 giây
      env.ACCESS_TOKEN_LIFE
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET,
      // 15
      env.REFRESH_TOKEN_LIFE
    )
    const userSession = await userSessionModel.getSessionByUserId(existingUser._id, device)
    const resUser = pickUser(existingUser)
    resUser['is_2fa_verified'] = userSession?.is_2fa_verified
    // resUser['last_login'] = userSession.last_login || null
    // Trả về thông tin kèm theo 2 token bên trên
    return {
      accessToken,
      refreshToken,
      ...pickUser(resUser)
    }

  } catch (error) {
    throw error
  }
}

const loginGoogle = async (resBody) => {
  try {
    //
    const existingUser = await userModel.findOneByEmail(resBody.email)
    if (existingUser) {
      const userInfo = {
        _id: existingUser._id,
        email: existingUser.email
      }

      const accessToken = await JwtProvider.generateToken(
        userInfo,
        env.ACCESS_TOKEN_SECRET,
        env.ACCESS_TOKEN_LIFE
      )
      const refreshToken = await JwtProvider.generateToken(
        userInfo,
        env.REFRESH_TOKEN_SECRET,
        env.REFRESH_TOKEN_LIFE
      )

      return {
        accessToken,
        refreshToken,
        ...pickUser(existingUser)
      }
    }
    // Tạo data lưu vào database
    const dataNewUser = {
      email: resBody.email,
      username: resBody.name || resBody.email.split('@')[0],
      displayName: resBody.name || resBody.email.split('@')[0],
      avatar: resBody.picture || null,
      authProvider: 'google',
      isActive: true
    }
    const createdUser = await userModel.createNew(dataNewUser)
    const result = await userModel.findOneById(createdUser.insertedId)

    // Tạo tokens cho user mới
    const userInfo = {
      _id: result._id,
      email: result.email
    }

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET,
      env.ACCESS_TOKEN_LIFE
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET,
      env.REFRESH_TOKEN_LIFE
    )

    return {
      accessToken,
      refreshToken,
      ...pickUser(result)
    }


  } catch (error) {
    throw error
  }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    //
    const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET)
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    // Tạo ra accessToken
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET,
      // 5 // 5 giây
      env.ACCESS_TOKEN_LIFE
    )

    // Trả về accessToken
    return {
      accessToken
    }

  } catch (error) {
    throw error
  }
}

const update = async (userId, userAvatarFile, updateData) => {
  try {
    // Kiểm tra xem người dùng có tồn tại không
    const existingUser = await userModel.findOneById(userId)
    if (!existingUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')
    }
    // Khi thay đổi mật khẩu thì chắc chắn user đã active, nhưng cứ làm bước này cho chắc.
    if (!existingUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account is not active! Please verify your account first.')
    }
    let updatedUser = { }
    // Trường hợp thay đổi mật khẩu
    if (updateData.new_password && updateData.current_password) {
      if (existingUser.authProvider !== 'local') {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot change password for social login accounts.')
      }
      if (!existingUser.password) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'This account does not have a password.')
      }
      // Kiểm tra xem current_password có đúng hay không
      if (!bcrypt.compareSync(updateData.current_password, existingUser.password)) {
        // Nên tránh mã authorized 401 vì khi trả về mã 401 cho bên fe thì phần interceptor sẽ logout luôn
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Current password is incorrect!')
      }
      updatedUser = await userModel.update(
        userId,
        { password: bcrypt.hashSync(updateData.new_password, 8) }
      )

    } else if (userAvatarFile) {
      // upload lên cloundinary
      const userAvatar = await cloudinaryProvider.streamUpload(userAvatarFile.buffer, 'avatars')
      // Lưu lại url avatar vào database
      updatedUser = await userModel.update(userId, { avatar: userAvatar.secure_url })
    } else {
      // update các thông tin khác
      updatedUser = await userModel.update(userId, updateData)
    }
    // Cập nhật thông tin người dùng
    return pickUser(updatedUser)

  } catch (error) {
    throw error
  }
}

const get2FA_QRCode = async (userId) => {
  try {
    const user = await userModel.findOneById(userId)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')
    }
    // Biến lưu trữ 2fa secret key của user trong Database > 2fa_secret_keys tại đây
    let twoFactorSecretKeyValue = null
    const twoFactorSecretKey = await twoFASecretKeyModel.getSecretKeyByUserId(userId)
    if (twoFactorSecretKey) {
      twoFactorSecretKeyValue = twoFactorSecretKey.value
    }
    else {
      // Tạo mới secret key và lưu vào db
      twoFactorSecretKeyValue = authenticator.generateSecret()
      await twoFASecretKeyModel.createNew({
        userId: userId,
        value: twoFactorSecretKeyValue
      })
    }
    const otpAuthToken = authenticator.keyuri(user.email, serviceName, twoFactorSecretKeyValue)
    // Tạo QR code từ OTP token trên
    const qrCodeImageUrl = await qrcode.toDataURL(otpAuthToken)

    return { qrCodeImageUrl }
  } catch (error) {
    throw error
  }
}

const setup2FA = async (userId, reqBody, device) => {
  try {
    const user = await userModel.findOneById(userId)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')
    }
    const twoFactorSecretKey = await twoFASecretKeyModel.getSecretKeyByUserId(userId)
    if (!twoFactorSecretKey) {
      throw new ApiError(StatusCodes.NOT_FOUND, '2FA secret key not found!')
    }
    const secretKey = twoFactorSecretKey.value
    const otpTokenFromClient = reqBody.otpToken
    if (!otpTokenFromClient) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP token is required!')
    }
    // Verify OTP token
    const isValid = authenticator.verify({ token: otpTokenFromClient, secret: secretKey })
    if (!isValid) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid OTP token!')
    }
    // Cập nhật trạng thái 2fa của user
    const updatedUser = await userModel.update(userId, { require_2fa: true })
    userSessionModel.createNew({ userId: userId, device_id: device, is_2fa_verified: true })
    return {
      ...pickUser(updatedUser),
      is_2fa_verified: true
    }
  } catch (error) {
    throw error
  }
}

const verify2FA = async (userId, reqBody, device) => {
  try {
    const user = await userModel.findOneById(userId)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')
    }
    const twoFactorSecretKey = await twoFASecretKeyModel.getSecretKeyByUserId(userId)
    if (!twoFactorSecretKey) {
      throw new ApiError(StatusCodes.NOT_FOUND, '2FA secret key not found!')
    }
    const secretKey = twoFactorSecretKey.value
    const otpTokenFromClient = reqBody.otpToken
    if (!otpTokenFromClient) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP token is required!')
    }
    // Verify OTP token
    const isValid = authenticator.verify({ token: otpTokenFromClient, secret: secretKey })
    if (!isValid) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid OTP token!')
    }
    const userSession = await userSessionModel.getSessionByUserId(user._id, device)
    // Cập nhật trạng thái 2fa của user
    if (!userSession) {
      await userSessionModel.createNew({ userId: userId, device_id: device, is_2fa_verified: true })
    }
    return {
      ...pickUser(user),
      is_2fa_verified: true
    }
  } catch (error) {
    throw error
  }
}

const forgotPassword = async (email) => {
  try {
    const userId = await userModel.findOneByEmail(email)
    if (!userId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')
    }
    const token = uuidv4()
    await userModel.update(userId._id, { verifyToken: token })
    const resetLink = `${WEBSITE_DOMAIN}/reset-password?email=${email}&token=${token}`
    const to = email
    const html = `
    <h1>Password Reset Request</h1>
    <p>We received a request to reset your password. Click the link below to reset it:</p>
    <h3>${resetLink}</h3>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Thank you!</p>
    `
    const customSubject = 'Trello MERN: Password Reset Request'
    await BrevoProvider.sendEmail(to, customSubject, html)
    return { message: 'Password reset link has been sent to your email.' }
  }
  catch (error) {
    throw error
  }
}

const resetPassword = async (email, token, password) => {
  try {
    const userId = await userModel.findOneByEmail(email)
    if (!userId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')
    }
    if (userId.verifyToken !== token) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invalid or expired token!')
    }
    const updateData = {
      password: bcrypt.hashSync(password, 8),
      verifyToken: null
    }
    await userModel.update(userId._id, updateData)
    return { message: 'Password has been reset successfully.' }
  }
  catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  loginGoogle,
  refreshToken,
  update,
  get2FA_QRCode,
  setup2FA,
  verify2FA,
  // disable2FA
  forgotPassword,
  resetPassword
}
