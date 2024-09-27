'use strict'

function mergeParams(event) {
  if ('httpMethod' in event === false) {
    return event
  }

  let body = {}

  // Parse JSON body
  try {
    body = JSON.parse(event.body)
  } catch (err) {
    // ~
  }

  if (body === null) {
    body = {}
  }

  // Merge path parameters
  if (event.pathParameters) {
    body = {
      ...body,
      ...event.pathParameters,
    }
  }

  // Merge query string parameters
  if (event.queryStringParameters) {
    body = {
      ...body,
      ...event.queryStringParameters,
    }
  }

  return body
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

module.exports = {
  mergeParams,
}
