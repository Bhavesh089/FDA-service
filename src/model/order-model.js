'use strict'

const Joi = require('joi')

const orderSchema = Joi.object({
  orderId: Joi.string(),
  userId: Joi.string().required(),
  restaurantId: Joi.string().required(),
  orderItems: Joi.array().items(Joi.string()).required(),
  deliveryAddress: Joi.string().required(),
  totalAmount: Joi.number().required(),
  vendorEarnings: Joi.number().required(),
  adminCommission: Joi.number().required(),
  orderStatus: Joi.string().required(),
  orderPlacedAt: Joi.date().required(),
  orderCompletedAt: Joi.date().required(),
})

module.exports = { TABLE_ORDERS: 'orders' }
