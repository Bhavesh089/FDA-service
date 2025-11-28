const {
  handleResponse,
  handleErrorResponse,
} = require('../lib/controller-utils')
const { TABLE_RESTAURANTS, validateRestaurants } = require('../model/restaurant-model')
const {
  getItemById,
  getByItemIds,
  getItemsWithFilters,
  createItems,
  updateItem
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
    console.log(ids, 'this is ids-->')
    console.log(`getRestaurantsByIds::Params::${{ ids }}`)
    const restaurants = await getByItemIds(TABLE_RESTAURANTS, { id: ids })
    console.log(restaurants)

    return handleResponse(true, 200, 'Get Restaurants Success', {restaurants})
  } catch (error) {
    return handleErrorResponse(error, 'getRestaurantsByIds')
  }
}

const updateRestaurant = async (restaurantPayload) => {
  try {
    console.log(
      `updateRestaurant::Params::${JSON.stringify({ restaurantPayload }, null, 2)}`
    )
    const restaurant = await updateItem(TABLE_RESTAURANTS, restaurantPayload)
    console.log(restaurant)

    return handleResponse(true, 200, 'Update Restaurant Success', {restaurant})
  } catch (error) {
    return handleErrorResponse(error, 'updateRestaurant')
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

    const restaurants = await getItemsWithFilters(TABLE_RESTAURANTS, {
      filters: {
        conditions: [{ field: 'name', operator: 'contains', value: name }],
      },
    })

    console.log(result)

    return handleResponse(true, 200, 'Get Restaurants by name Success', restaurants)
  } catch (error) {
    return handleErrorResponse(error, 'getRestaurantsByName')
  }
}

/**
 * Get restaurants by User id
 * @async
 * @param {String} user_id - User
 * @returns {Promise<Object>}
 */
const getRestaurantsByUserId = async ({user_id}) => {
  try {
    console.log(`getRestaurantsByUserId::Params::${{ user_id }}`)
    
    const restaurants = await getItemsWithFilters(TABLE_RESTAURANTS, null, 'user_id', user_id
   )

    if (!restaurants ||restaurants.length < 0) {
      return handleResponse(false, 404, 'No restaurants are found for this user')
    }

    return handleResponse(true, 200, 'Get Restaurants success', {restaurants})
  } catch (error) {
    return handleErrorResponse(error, 'getRestaurantsByUserId')
  }
}

module.exports = {
  createRestaurant,
  getRestaurantById,
  getRestaurantsByIds,
  getRestaurantsByName,
  getAllRestaurants,
  getRestaurantsByUserId,
  updateRestaurant
}
