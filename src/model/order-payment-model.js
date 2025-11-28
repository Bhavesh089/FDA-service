'use strict'

const Joi = require('joi')

const orderPaymentSchema = Joi.object({
  paymentId: Joi.string(),
  orderId: Joi.string().required(),
  userId: Joi.string().required(),
  paymentMethod: Joi.string().required(),
  paymentAmount: Joi.number().optional(),
  paymentDoneAt: Joi.date().optional(),
  paymentStatus: Joi.string().required(),
})

module.exports = { TABLE_ORDER_PAYMENTS: 'order_payments' }
