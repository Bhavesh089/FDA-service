const orders = require('../controllers/orders-controller')
const handler = require('../lib/handler')
require('dotenv').config();

module.exports = new Proxy(orders, {
  get: function (target, prop) {
    if (target[prop]) return async (event) => await handler(target[prop], event)
  },
})
