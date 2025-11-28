const category = require('../controllers/category-controller')
const handler = require('../lib/handler')
require('dotenv').config();

module.exports = new Proxy(category, {
  get: function (target, prop) {
    if (target[prop]) return async (event) => await handler(target[prop], event)
  },
})
