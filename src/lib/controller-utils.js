const handleErrorResponse = (error, action, message = undefined) => {
  console.error(`${action}::${error?.message}`)
  console.error(error)

  return {
    status: false,
    statusCode: 500,
    message: `Error in ${action}::${message ?? ''}`,
    error: { message: error?.message, error },
  }
}

const handleResponse = (
  status,
  statusCode,
  message = undefined,
  data = undefined
) => {
  return {
    status,
    statusCode,
    ...(message && { message }),
    ...(data && { data: data }),
  }
}

module.exports = {
  handleResponse,
  handleErrorResponse,
}
