'use strict'

const Joi = require('joi')

const menuItemSchema = Joi.object({
  menuItemId: Joi.string(),
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

module.exports = { validateMenuItems, TABLE_MENU_ITEMS: 'menu_items' }
