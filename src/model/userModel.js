const Joi = require('joi');

// Define User schema with Joi validation
const userSchema = Joi.object({
  UserID: Joi.string(),
  Name: Joi.string().required(),
  Email: Joi.string().email().optional(),
  Phone: Joi.string().min(10).max(15).optional(),
  Role: Joi.string().valid('Customer', 'Vendor', 'Admin').required(),
  TotalEarnings: Joi.number().optional(),
  RegisteredRestaurants: Joi.array().items(Joi.string()).optional(),
  OrderHistory: Joi.array().items(Joi.string()).optional(),
  Favorites: Joi.array().items(Joi.string()).optional(),
  Account_status: Joi.string().valid('active', 'inactive'),
  password: Joi.string().optional(),
  CreatedAt: Joi.date().optional(),
  Address: Joi.string().optional(),
  RestaurantID: Joi.string().optional(),
});

const validateUsers = (data) => {
    if (Array.isArray(data)) {
      return Joi.array().items(userSchema).validate(data);
    } else {
      return userSchema.validate(data);
    }
  };
  
module.exports = { validateUsers };
