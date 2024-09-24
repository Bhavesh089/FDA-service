const auth = require('../controllers/auth')
const handler = require('../lib/handler')

module.exports = new Proxy(auth, {
  get: function (target, prop) {
    if (target[prop]) return async (event) => await handler(target[prop], event)
  },
})
