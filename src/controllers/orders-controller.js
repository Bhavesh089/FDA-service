const {
  handleResponse,
  handleErrorResponse,
} = require('../lib/controller-utils')
const { TABLE_ORDERS } = require('../model/order-model')
const {
  getItemById,
  getByItemIds,
  getItemsWithFilters,
} = require('../services/dynamoService')

/**
 * Get Order By orderId
 * @async
 * @param {String} orderId
 * @returns {Promise<Object>}
 */
const getOrderById = async ({ orderId }) => {
  try {
    console.log(`getOrderById::Params::${{ orderId }}`)
    const order = await getItemById(TABLE_ORDERS, 'orderId', orderId)
    console.log(order)

    if (!order || !order?.orderId) {
      return handleResponse(false, 404, 'Order Not Found')
    }

    return handleResponse(true, 200, 'Get Order Success', order)
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
const getOrdersByIds = async ({ orderIds }) => {
  try {
    console.log(`getOrdersByIds::Params::${{ orderIds }}`)
    const result = await getByItemIds(TABLE_ORDERS, { orderId: orderIds })
    console.log(result)

    return handleResponse(true, 200, 'Get Orders by orderIds Success', result)
  } catch (error) {
    return handleErrorResponse(error, 'getOrdersByIds')
  }
}

/**
 * Get Orders by userId
 * @async
 * @param {String} userId
 * @returns {Promise<Object[]>}
 */
const getOrdersByUserId = async ({ userId }) => {
  try {
    console.log(`getOrdersByUserId::Params::${{ userId }}`)

    const result = await getItemsWithFilters(TABLE_ORDERS, {
      filters: {
        conditions: [{ field: 'userId', operator: '=', value: userId }],
      },
    })

    console.log(result)

    return handleResponse(true, 200, 'Get Orders by userId Success', result)
  } catch (error) {
    return handleErrorResponse(error, 'getOrdersByUserId')
  }
}

module.exports = {
  getOrderById,
  getOrdersByIds,
  getOrdersByUserId,
}
