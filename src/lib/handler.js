const { mergeParams } = require('../request')
const { api } = require('../response')

module.exports = async (handler, event) => {
  const { success, error } = api
  try {
    const params = mergeParams(event)
    return success(await handler(params))
  } catch (err) {
    return error(err)
  }
}
