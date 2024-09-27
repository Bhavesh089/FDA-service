'use strict'

const Joi = require('joi')

// Define User schema with Joi validation
const menuItemSchema = Joi.object({
  menuItemId: Joi.string(), // #CHECK b
  restaurantId: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  category: Joi.string().required(),
  isAvailable: Joi.boolean().required(),
  imageUrl: Joi.string().required(),
  rating: Joi.number().optional(),
})

const validateMenuItems = (data) => {
  if (Array.isArray(data)) {
    return Joi.array().items(menuItemSchema).validate(data)
  } else {
    return menuItemSchema.validate(data)
  }
}

module.exports = { validateMenuItems, TABLE_USERS: 'menu_items' }
