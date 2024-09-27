const Joi = require('joi')

const { USER_ROLES } = require('../constants/constants')

// Define User schema with Joi validation
const userSchema = Joi.object({
  UserId: Joi.string(),
  Name: Joi.string().required(),
  Email: Joi.string().email().optional(),
  Phone: Joi.string().min(10).max(15).optional(),
  Password: Joi.string().optional(),
  Otp: Joi.string().optional(),
  Role: Joi.string()
    .valid(...USER_ROLES)
    .required(),
  TotalEarnings: Joi.number().optional(),
  AccountStatus: Joi.string().valid('active', 'inactive'),
  CreatedAt: Joi.date().optional(),
  Address: Joi.string().optional(),

  RegisteredRestaurants: Joi.array().items(Joi.string()).optional(),
  OrderHistory: Joi.array().items(Joi.string()).optional(),
  Favorites: Joi.array().items(Joi.string()).optional(),
})

const validateUsers = (data) => {
  if (Array.isArray(data)) {
    return Joi.array().items(userSchema).validate(data)
  } else {
    return userSchema.validate(data)
  }
}

module.exports = { validateUsers }
