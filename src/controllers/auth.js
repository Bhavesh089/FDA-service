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

module.exports = {
  login,
}
