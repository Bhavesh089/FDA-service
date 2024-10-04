'use strict'

const Joi = require('joi')
const { ORDER_STATUSES } = require('../constants/constants')

const orderSchema = Joi.object({
  user_id: Joi.string().required(),
  restaurant_id: Joi.string().required(),
  order_items: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().integer().min(1).required(),
    id: Joi.string().required()
  })).required(),
  delivery_address: Joi.string().required(),
  total_amount: Joi.number().required(),
  vendor_earnings: Joi.number().required(),
  admin_commission: Joi.number().required(),
  order_status: Joi.string().required().valid(...ORDER_STATUSES),
  order_placed_at: Joi.date().required(),
  order_completed_at: Joi.date().allow(null).optional(),
  type: Joi.string().required(),
})

const validateOrders = (data) => {
  if (Array.isArray(data)) {
    return Joi.array().items(orderSchema).validate(data)
  } else {
    return orderSchema.validate(data)
  }
}
module.exports = { validateOrders, TABLE_ORDERS: 'orders' }
