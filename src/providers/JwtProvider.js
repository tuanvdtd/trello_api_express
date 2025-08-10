// https://www.npmjs.com/package/jsonwebtoken

import JWT from 'jsonwebtoken'

// Tạo mới token cần 3 trường thông tin:
// userInfo: thông tin người dùng, thường là _id và email
// secretSignature (hoặc privateKey): chuỗi bí mật dùng để mã hóa token
// tokenLife: thời gian sống của token

const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    //
    return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) {
    throw new Error(error)
  }
}

const verifyToken = async (token, secretSignature) => {
  try {
    //
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}
