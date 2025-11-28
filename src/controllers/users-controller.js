'use strict'

const {
  getItemById,
  createItems,
  getByItemIds,
  getItemsWithFilters,
  queryItemsWithFilters,
  updateItem,
} = require('../services/dynamoService')
const { TABLE_USERS, validateUsers } = require('../model/user-model')
const { USER_CUSTOMER_ROLE } = require('../constants/constants')
const {
  handleErrorResponse,
  handleResponse,
} = require('../lib/controller-utils')

/**
 * Get User By userId
 * @async
 * @param {String} id
 * @returns {Promise<Object>}
 */
const getUserById = async ({ id }) => {
  try {
    console.log(`getUserById::Params::${{ id }}`)
    const user = await getItemById(TABLE_USERS, 'id', id)
    console.log(user,'user')

    if (!user || !user?.id) {
      return handleResponse(false, 404, 'User Not Found')
    }

    return handleResponse(true, 200, 'Get User Success', user)
  } catch (error) {
    return handleErrorResponse(error, 'getUserById')
  }
}

/**
 * Create User
 * @async
 * @param {User} userPayload
 * @returns {Promise<Object>}
 */
const createUser = async (userPayload) => {
  try {
    console.log(
      `createUser::Params::${{ userPayload: JSON.stringify(userPayload, null, 2) }}`
    )
    const result = await createItems(TABLE_USERS, userPayload, validateUsers)
    console.log(result)

    return handleResponse(true, 201, 'Create User Success', result)
  } catch (error) {
    return handleErrorResponse(error, 'createUser')
  }
}

/**
 * Get Users by user ids
 * @async
 * @param {{ string[]}} userIds
 * @returns {Proimse<Object[]>}
 */
const getUserByIds = async ({ userIds }) => {
  try {
    console.log(
      `getUserByIds::Params::${{ userIds: JSON.stringify(userIds, null, 2) }}`
    )
    const result = await getByItemIds(TABLE_USERS, { userId: userIds })
    console.log(result)

    return handleResponse(true, 200, 'Get Users Success', result)
  } catch (error) {
    return handleErrorResponse(error, 'getUserByIds')
  }
}

const queryUsersByFilters = async ({ primaryKey = {}, filters = {} }) => {
  try {
    console.log(
      `queryUsersByFilters::Params::${JSON.stringify({ primaryKey, filters }, null, 2)}`
    )
    // console.log(primaryKey, filters, "this is filters-->")
    const result = await getItemsWithFilters(TABLE_USERS, filters)
    // const result = await queryItems("fda-users", primaryKey, filters);

    //   const filters = {
    //     conditions: [
    //       { field: 'Role', operator: '=', value: 'Vendor' },    // Filtering based on Role
    //       { field: 'RegisteredRestaurants', operator: 'contains', value: 'rest001' }, // Check if RegisteredRestaurants contains 'rest001'
    //     ],
    //   };
    // const result = await queryItemsWithFilters("fda-users", primaryKey, filters);
    console.log(result)
    return handleResponse(true, 200, 'Query Users Success', result)
  } catch (error) {
    return handleErrorResponse(error, 'queryUsersByFilters')
  }
}

// Find Criteria? - #CHECK
const updateUser = async (userPayload) => {
  try {
    console.log(
      `updateUser::Params::${JSON.stringify({ userPayload }, null, 2)}`
    )
    const result = await updateItem(TABLE_USERS, userPayload)
    console.log(result)

    return handleResponse(true, 200, 'Update User Success', {user: result})
  } catch (error) {
    return handleErrorResponse(error, 'updateUser')
  }
}

// const updateUser = async (userPayload) => {
//   try {
//     console.log(
//       `queryUsers::Params::${JSON.stringify({ primaryKey, filters }, null, 2)}`
//     )
//     const result = await updateItem(TABLE_USERS, userPayload, ['user'])
//     console.log(result)

//     return handleResponse(true, 200, 'Update User Success', result)
//   } catch (error) {
//     return handleErrorResponse(error, 'updateUser')
//   }
// }

/**
 * Get user details by mobile number
 * @async
 * @param {String} mobileNumber - User mobile number
 * @returns {Promise<Object>}
 */
const getUserByMobileNumber = async (mobileNumber) => {
  try {
    console.log(`getUserByMobileNumber::Params::${{ mobileNumber }}`)
    
    const users = await getItemsWithFilters(TABLE_USERS, null, 'phone', mobileNumber
   )
    const user = users?.[0]

    if (!user || !user?.id) {
      return handleResponse(false, 404, 'User Not Found')
    }

    return handleResponse(true, 200, 'Get User Success', user)
  } catch (error) {
    return handleErrorResponse(error, 'getUserByMobileNumber')
  }
}

const getAllUsers= async (params) => {
  try {
    console.log(
      `getUsers::Params::${{ userPayload: JSON.stringify(params, null, 2) }}`
    )
    const result = await getItemsWithFilters(TABLE_USERS, {})
    console.log(result)

    return handleResponse(true, 200, 'Get Users Success', {users: result})
  } catch (error) {
    return handleErrorResponse(error, 'createUser')
  }
}

module.exports = {
  getUserById,
  createUser,
  getUserByIds,
  queryUsers: queryUsersByFilters,
  updateUser,
  getAllUsers,
  getUserByMobileNumber,
}
