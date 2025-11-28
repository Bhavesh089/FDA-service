'use strict'

const { SignJWT } = require('jose')
const { TextEncoder } = require('util'); // Import TextEncoder
const { getUserByMobileNumber } = require('./users-controller')
const { DEFAULT_AUTH_EXPIRY_TIME } = require('../constants/auth-constants')
const {
  handleResponse,
  handleErrorResponse,
} = require('../lib/controller-utils')

/**
 * Verify User Login Otp
 * @async
 * @param {{ loginId: String; otp: String; }}
 * @returns {Proimse<{status: Boolean; message: String; data?: {token: String;}}>}
 */
const verifyLoginOtp = async ({login_id, otp}) => {
  try {
    // console.log(params, 'this is params')
    // Assuming loginId to be mobile number for all users
    console.log(`verifyLoginOtp::Params::${{ login_id, otp }}`)
    console.log(login_id)
    const userDetailsResponse = await getUserByMobileNumber(login_id)

    if (!userDetailsResponse.status) {
      return {
        ...userDetailsResponse,
      }
    }

    const user = userDetailsResponse.data
    if (user.otp !== otp) {
      return handleResponse(false, 401, 'Wrong OTP')
    }
    console.log(user, "this is user forom auth")
    const token = await generateUserLoginToken(constructPaylodForUserAuth(user))

    return handleResponse(true, 200, 'Login Success', { token, user })
  } catch (error) {
    return handleErrorResponse(error, 'verifyLoginOtp')
  }
}

const generateUserLoginToken = async (payload) => {
  const secretKey = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET); // Replace 'secret' with your actual secret key

  console.log(process.env.ACCESS_TOKEN_SECRET, 'this is the secrete')
  console.log(payload, "this is payload from token")
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(DEFAULT_AUTH_EXPIRY_TIME)
    .sign(secretKey)

  return jwt
}

const constructPaylodForUserAuth = (user) => {
  const { id, role } = user
  return {
    id,
    role,
  }
}

module.exports = {
  verifyLoginOtp,
}
