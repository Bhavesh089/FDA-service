'use strict'

const { SignJWT } = require('jose')

const { getUserByMobileNumber } = require('./users-controller')
const { DEFAULT_AUTH_EXPIRY_TIME } = require('../constants/auth-constants')

/**
 * Verify User Login Otp
 * @async
 * @param {{ loginId: String; otp: String; }}
 * @returns {Proimse<{status: Boolean; message: String; data?: {token: String;}}>}
 */
const verifyLoginOtp = async ({ loginId, otp }) => {
  try {
    // Assuming loginId to be mobile number for all users
    console.log(`verifyLoginOtp::Params::${{ loginId, otp }}`)
    const userDetailsResponse = await getUserByMobileNumber(loginId)

    if (!userDetailsResponse.status) {
      return {
        ...userDetailsResponse,
      }
    }

    const user = userDetailsResponse.data
    if (user.otp !== otp) {
      return {
        status: false,
        statusCode: 401,
        message: 'Wrong OTP',
      }
    }

    return {
      status: true,
      statusCode: 200,
      message: 'Login Success',
      data: {
        token: await generateUserLoginToken(constructPaylodForUserAuth(user)),
      },
    }
  } catch (error) {
    console.error(`verifyLoginOtp:: ${error?.message}`)
    console.error(error)
    return {
      status: false,
      statusCode: 500,
      message: 'Error in Verifying Login Otp',
      error: { message: error?.message, error },
    }
  }
}

const generateUserLoginToken = async (payload) => {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(DEFAULT_AUTH_EXPIRY_TIME)
    .sign(process.env.ACCESS_TOKEN_SECRET)

  return jwt
}

const constructPaylodForUserAuth = (user) => {
  const { userId, role } = user
  return {
    userId,
    role,
  }
}

module.exports = {
  verifyLoginOtp,
}
