'use strict'

const Joi = require('joi')

const restaurantsSchema = Joi.object({
  user_id: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  address: Joi.string().required(),
  rating: Joi.number().optional(),
  menu: Joi.array().items(Joi.string()),
  cuisine_type: Joi.string().optional(),
  image_url:Joi.string().optional(),
  operating_hours: Joi.string().required(),
  contact_details: Joi.string().required(),
  commission_rate: Joi.number().required(),
  total_earnings: Joi.number(),
})

const validateRestaurants = (data) => {
  if (Array.isArray(data)) {
    return Joi.array().items(restaurantsSchema).validate(data)
  } else {
    return restaurantsSchema.validate(data)
  }
}

module.exports = { validateRestaurants, TABLE_RESTAURANTS: 'restaurants' }
