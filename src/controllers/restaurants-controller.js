const { TABLE_RESTAURANTS } = require('../model/restaurant-model')
const { getItemById, getByItemIds } = require('../services/dynamoService')

/**
 * Get Restaurant By restaurantId
 * @async
 * @param {String} id
 * @returns {Promise<Object>}
 */
const getRestaurantById = async ({ id }) => {
  try {
    console.log(`getRestaurantById::Params::${{ id }}`)
    const restaurant = await getItemById(TABLE_RESTAURANTS, 'restaurantId', id)
    console.log(restaurant)

    if (!restaurant || !restaurant.restaurantId) {
      return {
        status: false,
        statusCode: 404,
        message: 'Restaurant Not Found',
      }
    }

    return {
      status: true,
      statusCode: 200,
      message: 'Get Restaurant Success',
      data: user,
    }
  } catch (error) {
    console.error(`getRestaurantById:: ${error?.message}`)
    console.error(error)
    return {
      status: false,
      statusCode: 500,
      message: 'Error in getting Restaurant by id',
      error: { message: error?.message, error },
    }
  }
}

/**
 * Get Restaurants By restaurantIds
 * @async
 * @param {String[]} id
 * @returns {Promise<Object[]>}
 */
const getRestaurantsByIds = async ({ ids }) => {
  try {
    console.log(`getRestaurantsByIds::Params::${{ ids }}`)
    const result = await getByItemIds(TABLE_RESTAURANTS, { restaurantId: ids })
    console.log(result)

    return result
  } catch (error) {
    console.error(`getRestaurantsByIds::${error?.message}`)
    console.error(error)
    return {
      status: false,
      statusCode: 500,
      message: 'Error in getting Restaurants by ids',
      error: { message: error?.message, error },
    }
  }
}

module.exports = {
  getRestaurantById,
  getRestaurantsByIds,
}
