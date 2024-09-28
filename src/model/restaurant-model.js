'use strict'

const Joi = require('joi')

const restaurantsSchema = Joi.object({
  restaurantId: Joi.string(),
  userId: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  address: Joi.string().required(),
  rating: Joi.number().optional(),
  menu: Joi.array().items(Joi.string()).required(),
  cuisineType: Joi.string().optional(),
  operatingHours: Joi.string().required(),
  contactDetails: Joi.string().required(),
  commissionRate: Joi.number().required(),
  totalEarnings: Joi.number().required(),
})

const validateRestaurants = (data) => {
  if (Array.isArray(data)) {
    return Joi.array().items(restaurantsSchema).validate(data)
  } else {
    return restaurantsSchema.validate(data)
  }
}

module.exports = { validateRestaurants, TABLE_RESTAURANTS: 'restaurants' }
