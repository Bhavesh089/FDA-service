'use strict'

const Joi = require('joi')

const { USER_ROLES, ACCOUNT_STATUSES } = require('../constants/constants')

const userSchema = Joi.object({
  userId: Joi.string(),
  name: Joi.string().required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().min(10).max(15).required(),
  password: Joi.string().optional(),
  otp: Joi.string().required(),
  role: Joi.string()
    .valid(...USER_ROLES)
    .required(),
  totalEarnings: Joi.number().optional(),
  accountStatus: Joi.string()
    .valid(...ACCOUNT_STATUSES)
    .required(),
  createdAt: Joi.date().required(),
  address: Joi.string().optional(),

  registeredRestaurants: Joi.array().items(Joi.string()).optional(),
  orderHistory: Joi.array().items(Joi.string()).optional(),
  favorites: Joi.array().items(Joi.string()).optional(),
})

const validateUsers = (data) => {
  if (Array.isArray(data)) {
    return Joi.array().items(userSchema).validate(data)
  } else {
    return userSchema.validate(data)
  }
}

module.exports = { validateUsers, TABLE_USERS: 'users' }
