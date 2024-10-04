'use strict'

const Joi = require('joi')
const { CATEGORY_TABLE_NAME } = require('../constants/constants')

const categorySchema = Joi.object({
  name: Joi.string().required(),
  image_url: Joi.string().optional(),
})

const validateCategory = (data) => {
  if (Array.isArray(data)) {
    return Joi.array().items(categorySchema).validate(data)
  } else {
    return categorySchema.validate(data)
  }
}

module.exports = { validateCategory, TABLE_CATEGORY: CATEGORY_TABLE_NAME }
