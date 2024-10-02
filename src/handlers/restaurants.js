const restaurants = require('../controllers/restaurants-controller')
const handler = require('../lib/handler')
require('dotenv').config();

module.exports = new Proxy(restaurants, {
  get: function (target, prop) {
    if (target[prop]) return async (event) => await handler(target[prop], event)
  },
})
