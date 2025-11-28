'use strict'

const Joi = require('joi')
const { ADMIN_APPROVAL_STATUSES } = require('../constants/constants')

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
  contact_details: Joi.string(),
  commission_rate: Joi.number(),
  total_earnings: Joi.number(),
  admin_approval: Joi.string().required().valid(...ADMIN_APPROVAL_STATUSES),
  is_available: Joi.boolean().required().valid(true, false),
})

const validateRestaurants = (data) => {
  if (Array.isArray(data)) {
    return Joi.array().items(restaurantsSchema).validate(data)
  } else {
    return restaurantsSchema.validate(data)
  }
}

module.exports = { validateRestaurants, TABLE_RESTAURANTS: 'restaurants' }
