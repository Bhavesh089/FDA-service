const {
  handleResponse,
  handleErrorResponse,
} = require('../lib/controller-utils')
const { TABLE_RESTAURANTS, validateRestaurants } = require('../model/restaurant-model')
const {
  getItemById,
  getByItemIds,
  getItemsWithFilters,
  createItems
} = require('../services/dynamoService')


/**
 * Create User
 * @async
 * @param {User} userPayload
 * @returns {Promise<Object>}
 */
const createRestaurant = async (restaurantPayload) => {
  try {
    console.log(
      `createUser::Params::${{ userPayload: JSON.stringify(restaurantPayload, null, 2) }}`
    )
    const result = await createItems(TABLE_RESTAURANTS, restaurantPayload, validateRestaurants)
    console.log(result)

    return handleResponse(true, 201, 'Create restaurant Success', result)
  } catch (error) {
    return handleErrorResponse(error, 'createUser')
  }
}

const getAllRestaurants = async (params) => {
  try {
    console.log(
      `getRestaurants::Params::${{ userPayload: JSON.stringify(params, null, 2) }}`
    )
    const result = await getItemsWithFilters(TABLE_RESTAURANTS, {})
    console.log(result)

    return handleResponse(true, 200, 'Get Restaurants Success', {restaurants: result})
  } catch (error) {
    return handleErrorResponse(error, 'createUser')
  }
}

/**
 * Get Restaurant By restaurantId
 * @async
 * @param {String} 
 * @returns {Promise<Object>}
 */
const getRestaurantById = async ({id}) => {
  try {
    console.log(`getRestaurantById::Params::${{ id }}`)
    const restaurant = await getItemById(TABLE_RESTAURANTS, 'id', id)
    console.log(restaurant)
    if (!restaurant || !restaurant?.id) {
      return handleResponse(false, 404, 'Restaurant Not Found')
    }

    return handleResponse(true, 200, 'Get Restaurant Success', {restaurant})
  } catch (error) {
    return handleErrorResponse(error, 'getRestaurantById')
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

    return handleResponse(true, 200, 'Get Restaurants Success', result)
  } catch (error) {
    return handleErrorResponse(error, 'getRestaurantsByIds')
  }
}

/**
 * Get Restaurants By name
 * @async
 * @param {String[]} name
 * @returns {Promise<Object[]>}
 */
const getRestaurantsByName = async ({ name }) => {
  try {
    console.log(`getRestaurantsByName::Params::${{ name }}`)

    const result = await getItemsWithFilters(TABLE_RESTAURANTS, {
      filters: {
        conditions: [{ field: 'name', operator: 'contains', value: name }],
      },
    })

    console.log(result)

    return handleResponse(true, 200, 'Get Restaurants by name Success', result)
  } catch (error) {
    return handleErrorResponse(error, 'getRestaurantsByName')
  }
}

module.exports = {
  createRestaurant,
  getRestaurantById,
  getRestaurantsByIds,
  getRestaurantsByName,
  getAllRestaurants
}
