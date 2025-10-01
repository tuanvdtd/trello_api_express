import { WHITELIST_DOMAINS } from '~/utils/constants'
import { env } from '~/config/environment'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// Cấu hình CORS Option trong dự án thực tế
export const corsOptions = {
  origin: function (origin, callback) {
    // console.log('CORS Origin:', origin)
    // Nếu môi trường là dev thì cho phép tất cả
    if ( env.BUILD_MODE === 'dev') {
      return callback(null, true)
    }
    // fix lỗi reload server bị lỗi CORS khi origin undefined (mở trực tiếp trên trình duyệt hoặc dùng tool như postman, curl để test API)
    if (!origin) {
      return callback(null, true)
    }
    // Ngược lại là production thì làm các bước tiếp theo
    // Kiểm tra xem origin có phải là domain được chấp nhận hay không
    if (WHITELIST_DOMAINS.includes(origin)) {
      return callback(null, true)
    }

    // Cuối cùng nếu domain không được chấp nhận thì trả về lỗi
    return callback(new ApiError(StatusCodes.FORBIDDEN, `${origin} not allowed by our CORS Policy.`))
  },

  // Some legacy browsers (IE11, various SmartTVs) choke on 204
  optionsSuccessStatus: 200,

  // CORS sẽ cho phép nhận cookies từ request
  credentials: true
}