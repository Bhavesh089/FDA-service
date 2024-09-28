'use strict'

const Joi = require('joi')

const orderPaymentSchema = Joi.object({
  paymentId: Joi.string(),
  orderId: Joi.string(),
  paymentMethod: Joi.string().optional(),
  paymentAmount: Joi.number().optional(),
  paymentDoneAt: Joi.date().optional(),
  paymentStatus: Joi.string().optional(),
})

module.exports = { TABLE_ORDER_PAYMENTS: 'order_payments' }
