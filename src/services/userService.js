/* eslint-disable no-useless-catch */
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/fomatter'
import { ResendProvider } from '~/providers/ResendProvider'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'

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
      displayName: nameFromEmail, // Mặc định tên hiển thị là tên từ email
      verifyToken: uuidv4()
    }

    const createdUser = await userModel.createNew(newUser)
    const result = await userModel.findOneById(createdUser.insertedId)

    // Gửi email cho người dùng xác thực tài khoản
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${result.email}&token=${result.verifyToken}`
    const to = result.email
    const subject = 'Welcome to Our Service!'
    const html = `
    <h1>Welcome!</h1>
    <h2>Thank you for joining us.</h2>
    <h3>Here is your verification link:</h3>
    <h3>${verificationLink}</h3>
    <h3>Sincerely!</h3>
    `
    await ResendProvider.sendEmail({ to, subject, html })

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

const login = async (resBody) => {
  try {
    //
    const existingUser = await userModel.findOneByEmail(resBody.email)
    if (!existingUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    if (!existingUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account is not active! Please verify your account first.')
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

    // Trả về thông tin kèm theo 2 token bên trên
    return {
      accessToken,
      refreshToken,
      ...pickUser(existingUser)
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

    // Trả về thông tin kèm theo 2 token bên trên
    return {
      accessToken
    }

  } catch (error) {
    throw error
  }
}

const update = async (userId, updateData) => {
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
      // Kiểm tra xem current_password có đúng hay không
      if (!bcrypt.compareSync(updateData.current_password, existingUser.password)) {
        // Nên tránh mã authorized 401 vì khi trả về mã 401 cho bên fe thì phần interceptor sẽ logout luôn
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Current password is incorrect!')
      }
      updatedUser = await userModel.update(
        userId,
        { password: bcrypt.hashSync(updateData.new_password, 8) }
      )

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

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}
