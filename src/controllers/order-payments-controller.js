const {
  handleResponse,
  handleErrorResponse,
} = require('../lib/controller-utils')
const { TABLE_ORDER_PAYMENTS } = require('../model/order-payment-model')
const {
  getItemById,
  getByItemIds,
  getItemsWithFilters,
} = require('../services/dynamoService')

/**
 * Get Order Payment By paymentId
 * @async
 * @param {String} paymentId
 * @returns {Promise<Object>}
 */
const getOrderPaymentById = async ({ paymentId }) => {
  try {
    console.log(`getOrderPaymentById::Params::${{ paymentId }}`)
    const order = await getItemById(
      TABLE_ORDER_PAYMENTS,
      'paymentId',
      paymentId
    )
    console.log(order)

    if (!order || !order?.orderId) {
      return handleResponse(false, 404, 'Order Payment Not Found')
    }

    return handleResponse(true, 200, 'Get Order Payment Success', order)
  } catch (error) {
    return handleErrorResponse(error, 'getOrderPaymentById')
  }
}

/**
 * Get Order Payments By paymentIds
 * @async
 * @param {String[]} paymentIds
 * @returns {Promise<Object[]>}
 */
const getOrderPaymentsByIds = async ({ paymentIds }) => {
  try {
    console.log(`getOrderPaymentsByIds::Params::${{ paymentIds }}`)
    const result = await getByItemIds(TABLE_ORDER_PAYMENTS, {
      paymentId: paymentIds,
    })
    console.log(result)

    return handleResponse(
      true,
      200,
      'Get Order Payments by orderIds Success',
      result
    )
  } catch (error) {
    return handleErrorResponse(error, 'getOrderPaymentsByIds')
  }
}

/**
 * Get Order Payments by userId
 * @async
 * @param {String} userId
 * @returns {Promise<Object[]>}
 */
const getOrderPaymentsByUserId = async ({ userId }) => {
  try {
    console.log(`getOrderPaymentsByUserId::Params::${{ userId }}`)

    const result = await getItemsWithFilters(TABLE_ORDER_PAYMENTS, {
      filters: {
        conditions: [{ field: 'userId', operator: '=', value: userId }],
      },
    })

    console.log(result)

    return handleResponse(
      true,
      200,
      'Get Order Payments by userId Success',
      result
    )
  } catch (error) {
    return handleErrorResponse(error, 'getOrderPaymentsByUserId')
  }
}

module.exports = {
  getOrderPaymentById,
  getOrderPaymentsByIds,
  getOrderPaymentsByUserId,
}
