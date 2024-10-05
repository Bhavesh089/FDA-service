'use strict'

const Joi = require('joi')

const menuItemSchema = Joi.object({
  restaurant_id: Joi.string().required(),
  restaurant_name: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  category: Joi.string(),
  category_id: Joi.string().required(),
  is_available: Joi.boolean().required().valid(true, false),
  image_url: Joi.string().optional(),
  rating: Joi.number().optional(),
  quantity: Joi.number().required()
})

const validateMenuItems = (data) => {
  if (Array.isArray(data)) {
    return Joi.array().items(menuItemSchema).validate(data)
  } else {
    return menuItemSchema.validate(data)
  }
}

module.exports = { validateMenuItems, TABLE_MENU_ITEMS: 'menu_items' }
