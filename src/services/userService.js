/* eslint-disable no-useless-catch */
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/fomatter'
import { ResendProvider } from '~/providers/ResendProvider'
import { WEBSITE_DOMAIN } from '~/utils/constants'

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

export const userService = {
  createNew
}
