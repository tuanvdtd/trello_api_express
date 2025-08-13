import multer from 'multer'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

// đọc docs npm multer để hiểu cách sử dụng, nó dùng để xử lí res.file trong express

// Kiểm tra file

export const LIMIT_COMMON_FILE_SIZE = 10485760 // byte = 10 MB
export const ALLOW_COMMON_FILE_TYPES = ['image/jpg', 'image/jpeg', 'image/png']

const cusFileFilter = (req, file, callback) => {
  // đối với multer thì dùng mimetype thay vì type
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(new ApiError(StatusCodes.UNSUPPORTED_MEDIA_TYPE, errMessage), null)
  }
  // Tham số đầu tiên của callback là error, nếu không có lỗi thì để null, tham số thứ 2 là thành công(true) hay không(null)
  callback(null, true)
}

// Tạo func upload file
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: cusFileFilter
})

export const multerUploadMiddleware = {
  upload
}