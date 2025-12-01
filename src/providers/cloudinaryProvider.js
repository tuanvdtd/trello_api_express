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

// Upload với public_id cố định và overwrite
const streamUploadWithOverwrite = (fileBuffer, folderName, publicId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinaryv2.uploader.upload_stream({
      folder: folderName,
      public_id: publicId,
      resource_type: 'auto',
      overwrite: true, // Ghi đè nếu đã tồn tại
      invalidate: true // Clear cache CDN
    },
    (error, result) => {
      if (result) {
        resolve(result)
      } else {
        reject(error)
      }
    })
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

const streamUploadAvatarWithOverwrite = (fileBuffer, folderName, publicId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinaryv2.uploader.upload_stream({
      folder: folderName,
      public_id: publicId,
      resource_type: 'auto',
      overwrite: true, // Ghi đè nếu đã tồn tại
      invalidate: true // Clear cache CDN
    },
    (error, result) => {
      if (result) {
        resolve({
          // url: result.url,
          secure_url: result.secure_url,
          // public_id: result.public_id,
          avatar_url: cloudinaryv2.url(result.public_id, {
            version: result.version,
            width: 100,
            height: 100,
            crop: 'fill', // Giữ đúng tỷ lệ và cắt cho vừa khung (thumbnail đều nhau, không méo).
            gravity: 'auto', // Tự động lấy phần trung tâm của ảnh
            fetch_format: 'auto' // Tự động chọn định dạng ảnh tối ưu
            // format: 'jpg' // Chuyển đổi sang định dạng jpg
          })
        })
      } else {
        reject(error)
      }
    })
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

// Xóa ảnh theo public_id (vẫn cần cho trường hợp khác)
const destroy = async (publicId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const res = await cloudinaryv2.uploader.destroy(publicId)
    return res
  } catch (error) {
    throw error
  }
}

export const cloudinaryProvider = {
  streamUpload,
  streamUploadWithOverwrite,
  destroy,
  streamUploadAvatarWithOverwrite
}

// const uploadResponse = await cloudinary.uploader.upload(profilePic, {
//           folder: 'users',
//           public_id: `user_${req.user._id} ${name}`, // Tên ảnh
//           overwrite: true, // Ghi đè nếu đã tồn tại
//         });
//         user.profilePic = uploadResponse.secure_url; // URL ảnh từ cloudinary