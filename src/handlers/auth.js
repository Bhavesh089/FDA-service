const auth = require('../controllers/auth-controller')
const handler = require('../lib/handler')
require('dotenv').config();

module.exports = new Proxy(auth, {
  get: function (target, prop) {
    if (target[prop]) return async (event) => await handler(target[prop], event)
  },
})
