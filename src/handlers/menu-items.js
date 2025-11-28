const menuItem = require('../controllers/menu-items-controller')
const handler = require('../lib/handler')
require('dotenv').config();

module.exports = new Proxy(menuItem, {
  get: function (target, prop) {
    if (target[prop]) return async (event) => await handler(target[prop], event)
  },
})
