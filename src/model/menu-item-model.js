'use strict'

const Joi = require('joi')

const menuItemSchema = Joi.object({
  restaurant_id: Joi.string().required(),
  restaurant_name: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  category: Joi.string().required(),
  category_id: Joi.string().required(),
  is_available: Joi.boolean().required(),
  image_url: Joi.string().required(),
  rating: Joi.number().optional(),
  quatity: Joi.number().required()
})

const validateMenuItems = (data) => {
  if (Array.isArray(data)) {
    return Joi.array().items(menuItemSchema).validate(data)
  } else {
    return menuItemSchema.validate(data)
  }
}

module.exports = { validateMenuItems, TABLE_MENU_ITEMS: 'menu_items' }
