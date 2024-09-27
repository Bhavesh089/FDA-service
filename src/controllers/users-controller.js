'use strict'

const {
  getItemById,
  createItems,
  getByItemIds,
  getItemsWithFilters,
  queryItemsWithFilters,
  updateItem,
} = require('../services/dynamoService')
const { TABLE_USERS } = require('../model/user-model')

/**
 * Get User By userId
 * @async
 * @param {String} id
 * @returns {Promise<Object>}
 */
const getUserById = async ({ id }) => {
  try {
    console.log(`getUserById::Params::${{ id }}`)
    const user = await getItemById(TABLE_USERS, 'userId', id)
    console.log(user)

    if (!user || !user.userId) {
      return {
        status: false,
        statusCode: 404,
        message: 'User Not Found',
      }
    }

    return {
      status: true,
      statusCode: 200,
      message: 'Get User Success',
      data: user,
    }
  } catch (error) {
    console.error(`getUserById::${error?.message}`)
    console.error(error)
    return {
      status: false,
      statusCode: 500,
      message: 'Error in getting user by id',
      error: { message: error?.message, error },
    }
  }
}

// #TODO - B
const createUser = async (userPayload) => {
  try {
    const result = await createItems(TABLE_USERS, userPayload, 'user')
    console.log(result, 'this is the result')
    return result
  } catch (error) {
    console.log(error, 'this is the error')
    return { statusCode: 400, body: JSON.stringify({ error: error.message }) }
  }
}

// #CHECK
const getUserByIds = async ({ UserID }) => {
  try {
    const result = await getByItemIds(TABLE_USERS, { UserID: UserID })
    console.log(result, 'this is the result')
    return result
  } catch (error) {
    console.log(error, 'this is the error')
    return { statusCode: 400, body: JSON.stringify({ error: error.message }) }
  }
}

// #TODO - B
const queryUsers = async ({ primaryKey = {}, filters = {} }) => {
  try {
    // console.log(primaryKey, filters, "this is filters-->")
    const result = await getItemsWithFilters(TABLE_USERS, filters)
    // const result = await queryItems("fda-users", primaryKey, filters);

    //   const filters = {
    //     conditions: [
    //       { field: 'Role', operator: '=', value: 'Vendor' },    // Filtering based on Role
    //       { field: 'RegisteredRestaurants', operator: 'contains', value: 'rest001' }, // Check if RegisteredRestaurants contains 'rest001'
    //     ],
    //   };
    console.log(filters, primaryKey)
    // const result = await queryItemsWithFilters("fda-users", primaryKey, filters);
    console.log(result, 'this is the result')
    return result
  } catch (error) {
    console.log(error, 'this is the error')
    return { statusCode: 400, body: JSON.stringify({ error: error.message }) }
  }
}

const updateUser = async (userPayload) => {
  try {
    const result = await updateItem(TABLE_USERS, userPayload, ['user'])
    console.log(result, 'this is the result')
    return result
  } catch (error) {
    console.log(error, 'this is the error')
    return { statusCode: 400, body: JSON.stringify({ error: error.message }) }
  }
}

/**
 * Get user details by mobile number
 * @async
 * @param {String} mobileNumber - User mobile number
 * @returns {Promise<Object>}
 */
const getUserByMobileNumber = async (mobileNumber) => {
  try {
    console.log(`getUserByMobileNumber::Params::${{ mobileNumber }}`)
    const users = await queryUsers({
      filters: {
        phone: mobileNumber,
      },
    })
    const user = users?.[0]

    if (!user) {
      return {
        status: false,
        statusCode: 404,
        message: 'User Not Found',
      }
    }

    return {
      status: true,
      statusCode: 200,
      message: 'Get User Success',
      data: user,
    }
  } catch (error) {
    console.error(`getUserByMobileNumber::${error?.message}`)
    console.error(error)
    return {
      status: false,
      statusCode: 500,
      message: 'Error in getting User',
      error: { message: error?.message, error },
    }
  }
}

// #IMPLEMENT
// const get = async (mobileNumber) => {
//   try {
//     console.log(`getUserByMobileNumber::Params:: ${{ mobileNumber }}`)
//     const users = await queryUsers({
//       filters: {
//         phone: mobileNumber,
//       },
//     })
//     const user = users?.[0]

//     if (!user) {
//       return {
//         status: false,
//         statusCode: 404,
//         message: 'User Not Found',
//       }
//     }

//     return {
//       status: true,
//       statusCode: 200,
//       message: 'Get User Success',
//       data: user,
//     }
//   } catch (error) {
//     console.error(`getUserByMobileNumber:: ${error?.message}`)
//     console.error(error)
//     return {
//       status: false,
//       statusCode: 500,
//       message: 'Error in getting User',
//       error: { message: error?.message, error },
//     }
//   }
// }

module.exports = {
  getUserById,
  createUser,
  getUserByIds,
  queryUsers,
  updateUser,

  getUserByMobileNumber,
}
