'use strict'

const Joi = require('joi')

// Define User schema with Joi validation
const orderAndPaymentSchema = Joi.object({
  orderId: Joi.string(), // #CHECK b
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

  // Payment Fields
  paymentMethod: Joi.string().required(),
  paymentAmount: Joi.number().required(),
  paymentDoneAt: Joi.date().required(),
  paymentStatus: Joi.string().required(),
  type: Joi.string().required(),
})

module.exports = { TABLE_ORDERS_AND_PAYMENTS: 'orders_and_payments' }
