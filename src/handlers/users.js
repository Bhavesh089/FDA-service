
const user = require('../controllers/users')
const handler = require('../lib/handler')

module.exports = new Proxy(user, {
  get: function (target, prop) {
    if(target[prop])
      return async event => await handler(target[prop], event)
  }
})
