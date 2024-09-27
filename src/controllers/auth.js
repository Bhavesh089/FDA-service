const { USER_ROLES } = require('../constants/constants')

function login({ email, mobileNumber, role }) {
  console.log({ email, mobileNumber, role })
  // Validation
  if (!role || USER_ROLES.includes(role.toUpperCase())) {
    return {
      status: false,
      message: 'Invalid Role',
    }
  }

  // User Exists
  return {
    status: true,
    message: 'Success',
  }
}

function generateOtp({ email, mobileNumber, role }) {
  console.log({ email, mobileNumber, role })

  return {
    status: true,
    message: 'Otp Generated',
    otpId: 123,
  }
}

function verifyLogin({ loginId, otp, role }) {
  console.log({ loginId, otp, role })

  return {
    status: true,
    message: 'Login Success',
    data: {
      token: '1234',
      userId: 1234,
    },
  }
}

function verifyToken({ authToken }) {
  console.log({ authToken })

  if (Math.random() > 0.5) {
    return {
      status: true,
      message: 'Valid Token',
    }
  } else {
    return {
      status: false,
      message: 'Token Expired',
    }
  }
}

module.exports = {
  login,
  generateOtp,
  verifyLogin,
  verifyToken,
}
