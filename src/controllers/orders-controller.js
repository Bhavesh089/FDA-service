const {
  handleResponse,
  handleErrorResponse,
} = require('../lib/controller-utils')
const { TABLE_ORDERS, validateOrders } = require('../model/order-model')
const {
  getItemById,
  getByItemIds,
  getItemsWithFilters,
  createItems,
  updateItem
} = require('../services/dynamoService')


const getOrders = async (params) => {
  try {
    console.log(
      `getOrders::Params::${{ orders: JSON.stringify(params, null, 2) }}`
    )
    const result = await getItemsWithFilters(TABLE_ORDERS, {})
    console.log(result)

    return handleResponse(true, 200, 'Get orders Success', {orders: result})
  } catch (error) {
    return handleErrorResponse(error, 'orders')
  }
}

const updateOrder = async (orderPayload) => {
  try {
    console.log(
      `updateOrder::Params::${JSON.stringify({ orderPayload }, null, 2)}`
    )
    const order = await updateItem(TABLE_ORDERS, orderPayload, 'order')
    console.log(order)

    return handleResponse(true, 200, 'Update Order Success', {order})
  } catch (error) {
    return handleErrorResponse(error, 'updateOrder')
  }
}

const createOrders = async (orderPayload) => {
  try {
    console.log(
      `createOrders::Params::${{ userPayload: JSON.stringify(orderPayload, null, 2) }}`
    )
    const result = await createItems(TABLE_ORDERS, orderPayload, validateOrders)
    console.log(result)

    return handleResponse(true, 201, 'Create Order items Success', {orders: result})
  } catch (error) {
    return handleErrorResponse(error, 'createOrders')
  }
}

/**
 * Get Order By orderId
 * @async
 * @param {String} orderId
 * @returns {Promise<Object>}
 */
const getOrderById = async ({ id }) => {
  try {
    console.log(`getOrderById::Params::${{ id }}`)
    const order = await getItemById(TABLE_ORDERS, 'id', id, 'order')
    console.log(order)

    if (!order || !order?.id) {
      return handleResponse(false, 404, 'Order Not Found')
    }

    return handleResponse(true, 200, 'Get Order Success',{order})
  } catch (error) {
    return handleErrorResponse(error, 'getOrderById')
  }
}

/**
 * Get Orders By orderIds
 * @async
 * @param {String[]} orderIds
 * @returns {Promise<Object[]>}
 */
const getOrdersByIds = async ({ ids }) => {
  try {
    console.log(`getOrdersByIds::Params::${{ ids }}`)
    const result = await getByItemIds(TABLE_ORDERS, { id: ids }, 'order')
    console.log(result)

    return handleResponse(true, 200, 'Get Orders by orderIds Success', {orders: result})
  } catch (error) {
    return handleErrorResponse(error, 'getOrdersByIds')
  }
}

const getOrdersByRestaurantIds = async ({ ids }) => {
  try {
    console.log(`getOrdersByRestaurantIds::Params::${{ ids }}`)
    const result = await getByItemIds(TABLE_ORDERS, { restaurant_id: ids }, null, true)
    console.log(result)

    return handleResponse(true, 200, 'Get Orders by orderIds Success', {orders: result})
  } catch (error) {
    return handleErrorResponse(error, 'getOrdersByRestaurantIds')
  }
}

/**
 * Get Orders by userId
 * @async
 * @param {String} userId
 * @returns {Promise<Object[]>}
 */
const getOrdersByUserId = async ({ user_id }) => {
  try {
    console.log(`getOrdersByUserId::Params::${{ user_id }}`)

    const result = await getItemsWithFilters(TABLE_ORDERS, null, 'user_id', user_id
    )
    console.log(result)

    return handleResponse(true, 200, 'Get Orders by userId Success', {orders: result})
  } catch (error) {
    return handleErrorResponse(error, 'getOrdersByUserId')
  }
}

const getOrdersByRestaurantId= async ({ restaurant_id }) => {
  try {
    console.log(`getOrdersByUserId::Params::${{ restaurant_id }}`)

    const result = await getItemsWithFilters(TABLE_ORDERS, null, 'restaurant_id', restaurant_id
    )
    console.log(result)

    return handleResponse(true, 200, 'Get Orders by userId Success', {orders: result})
  } catch (error) {
    return handleErrorResponse(error, 'getOrdersByRestaurantId')
  }
}

module.exports = {
  getOrderById,
  getOrdersByIds,
  getOrdersByUserId,
  createOrders,
  getOrdersByRestaurantIds,
  getOrders,
  updateOrder,
  getOrdersByRestaurantId
}
