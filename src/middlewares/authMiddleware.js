import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

const isAuthorized = async (req, res, next) => {
  const clientAccessToken = req.cookies?.accessToken

  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized: Token not found'))
    return
  }
  try {
    //
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET)
    // Lưu giá trị userId từ accessTokenDecoded vào req để các controller có thể sử dụng để lấy được dữ liệu người dùng
    req.jwtDecoded = accessTokenDecoded
    next()
  } catch (error) {
    // Nếu accessToken hết hạn trả về lỗi để gọi refreshToken
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Access token expired'))
      return
    }

    // Nếu accessToken không hợp lệ, bỏ qua, trả lỗi để frontend log out luôn
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized: Invalid token'))
  }
}

export const authMiddleware = {
  isAuthorized
}
