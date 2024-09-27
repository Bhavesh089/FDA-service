function success(data) {
  return {
    success: true,
    message: '',
    data,
    statusCode: 200,
  }
}

function error(data) {
  if (process.env.STAGE !== 'test') {
    const errorId = Math.random()
    console.error(
      `[${errorId}] Message: ${data.message}. Data: ${JSON.stringify(data)}. Stack: ${data.stack}`
    )
  }
  return {
    success: false,
    message: data.message,
    data: data.data,
    errorCode: data.errorCode,
  }
}

function httpError(data) {
  return {
    statusCode: data.httpStatusCode || 500,
    body: JSON.stringify(error(data), null, 2),
  }
}

function httpSuccess(data) {
  console.log('this is hte data')
  return {
    statusCode: 200,
    body: JSON.stringify(success(data), null, 2),
  }
}

module.exports = {
  microservice: {
    error,
    success,
  },
  api: {
    error: httpError,
    success: httpSuccess,
  },
}
