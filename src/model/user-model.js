const Joi = require('joi')

const { USER_ROLES, ACCOUNT_STATUSES } = require('../constants/constants')

// Define User schema with Joi validation
const userSchema = Joi.object({
  user_id: Joi.string(),
  name: Joi.string().required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().min(10).max(15).required(),
  password: Joi.string().optional(),
  otp: Joi.string().required(),
  role: Joi.string()
    .valid(...USER_ROLES)
    .required(),
  total_earnings: Joi.number().optional(),
  account_status: Joi.string()
    .valid(...ACCOUNT_STATUSES)
    .required(),
  created_at: Joi.date().required(),
  address: Joi.string().optional(),

  registered_restaurants: Joi.array().items(Joi.string()).optional(),
  order_history: Joi.array().items(Joi.string()).optional(),
  favorites: Joi.array().items(Joi.string()).optional(),
})

const validateUsers = (data) => {
  if (Array.isArray(data)) {
    return Joi.array().items(userSchema).validate(data)
  } else {
    return userSchema.validate(data)
  }
}

module.exports = { validateUsers }
