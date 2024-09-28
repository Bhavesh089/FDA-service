const {
  handleResponse,
  handleErrorResponse,
} = require('../lib/controller-utils')
const { TABLE_MENU_ITEMS } = require('../model/menu-item-model')
const {
  getItemById,
  getByItemIds,
  getItemsWithFilters,
} = require('../services/dynamoService')

/**
 * Get MenuItem By menuId
 * @async
 * @param {String} menuId
 * @returns {Promise<Object>}
 */
const getMenuItemById = async ({ menuId }) => {
  try {
    console.log(`getMenuItemById::Params::${{ menuId }}`)
    const menu = await getItemById(TABLE_MENU_ITEMS, 'menuId', menuId)
    console.log(menu)

    if (!menu || !menu?.menuId) {
      return handleResponse(false, 404, 'Menu Not Found')
    }

    return handleResponse(true, 200, 'Get Menu Success', menu)
  } catch (error) {
    return handleErrorResponse(error, 'getMenuItemById')
  }
}

/**
 * Get MenuItems By menuIds
 * @async
 * @param {String[]} menuIds
 * @returns {Promise<Object[]>}
 */
const getMenuItemsByIds = async ({ menuIds }) => {
  try {
    console.log(`getMenuItemsByIds::Params::${{ menuIds }}`)
    const result = await getByItemIds(TABLE_MENU_ITEMS, { menuId: menuIds })
    console.log(result)

    return handleResponse(
      true,
      200,
      'Get Menu Items by menuids Success',
      result
    )
  } catch (error) {
    return handleErrorResponse(error, 'getMenuItemsByIds')
  }
}

/**
 * Get MenuItems By name
 * @async
 * @param {String[]} name
 * @returns {Promise<Object[]>}
 */
const getMenuItemsByName = async ({ name }) => {
  try {
    console.log(`getMenuItemsByName::Params::${{ name }}`)

    const result = await getItemsWithFilters(TABLE_MENU_ITEMS, {
      filters: {
        conditions: [{ field: 'name', operator: 'contains', value: name }],
      },
    })

    console.log(result)

    return handleResponse(true, 200, 'Get Menu Items by name Success', result)
  } catch (error) {
    return handleErrorResponse(error, 'getMenuItemsByName')
  }
}

module.exports = {
  getMenuItemById,
  getMenuItemsByIds,
  getMenuItemsByName,
}
