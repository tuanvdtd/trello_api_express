import cloundinary from 'cloudinary'

import streamifier from 'streamifier'

import { env } from '~/config/environment'

// https://cloudinary.com/blog/node_js_file_upload_to_a_local_server_or_to_the_cloud
// tham khảo link này

// Cấu hình Cloudinary

const cloudinaryv2 = cloundinary.v2

cloudinaryv2.config(
  {
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
  }
)

// Khởi tạo file
const streamUpload = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    // Tạo 1 luồng stream upload lên cloudinary
    const stream = cloudinaryv2.uploader.upload_stream({ folder: folderName },
      (error, result) => {
        if (result) {
          resolve(result)
        } else {
          reject(error)
        }
      })
    // Thực hiện upload luồng stream
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

export const cloudinaryProvider = {
  streamUpload
}