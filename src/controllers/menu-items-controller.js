const {
  handleResponse,
  handleErrorResponse,
} = require('../lib/controller-utils')
const { TABLE_MENU_ITEMS, validateMenuItems } = require('../model/menu-item-model')
const {
  getItemById,
  getByItemIds,
  getItemsWithFilters,
  createItems,
  updateItem
} = require('../services/dynamoService')


const createMenuItems = async (itemsPayload) => {
  try {
    console.log(
      `createMenuItems::Params::${{ userPayload: JSON.stringify(itemsPayload, null, 2) }}`
    )
    const result = await createItems(TABLE_MENU_ITEMS, itemsPayload, validateMenuItems)
    console.log(result)

    return handleResponse(true, 201, 'Create Menu items Success', result)
  } catch (error) {
    return handleErrorResponse(error, 'createMenuItems')
  }
}
/**
 * Get MenuItem By menuId
 * @async
 * @param {String} menuId
 * @returns {Promise<Object>}
 */
const getMenuItemById = async ({ id }) => {
  try {
    console.log(`getMenuItemById::Params::${{ id }}`)
    const menu = await getItemById(TABLE_MENU_ITEMS, 'id', id)
    console.log(menu)

    if (!menu || !menu?.id) {
      return handleResponse(false, 404, 'Menu Not Found')
    }

    return handleResponse(true, 200, 'Get Menu Success', {menu_item: menu})
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

const getMenuItems = async (params) => {
  try {
    console.log(
      `getMenuItems::Params::${{ userPayload: JSON.stringify(params, null, 2) }}`
    )
    const result = await getItemsWithFilters(TABLE_MENU_ITEMS, {})
    console.log(result)

    return handleResponse(true, 200, 'Get MenuItems Success', {menu_items: result})
  } catch (error) {
    return handleErrorResponse(error, 'MenuItems')
  }
}

const getMenuItemsByRestaurantId = async ({restaurant_id}) => {
  try {
    console.log(`getMenuItemsByRestaurantId::Params::${{ restaurant_id }}`)
    
    const menuItems = await getItemsWithFilters(TABLE_MENU_ITEMS, null, 'restaurant_id', restaurant_id
   )

    if (!menuItems ||menuItems.length <= 0) {
      return handleResponse(false, 404, 'No menuItems are found for this restaurant')
    }

    return handleResponse(true, 200, 'Get Restaurants success', {menu_items: menuItems})
  } catch (error) {
    return handleErrorResponse(error, 'getMenuItemsByRestaurantId')
  }
}


const getMenuItemsByCatId = async ({category_id}) => {
  try {
    console.log(`getMenuItemsByCatId::Params::${{ category_id }}`)
    
    const menuItems = await getItemsWithFilters(TABLE_MENU_ITEMS, null, 'category_id', category_id
   )

    if (!menuItems ||menuItems.length <= 0) {
      return handleResponse(false, 404, 'No menuItems are found for this Category')
    }

    return handleResponse(true, 200, 'Get menu items success', {menu_items: menuItems})
  } catch (error) {
    return handleErrorResponse(error, 'getMenuItemsByCatId')
  }
}

const updateMenuItem = async (menuItemsPayload) => {
  try {
    console.log(
      `updateMenuItem::Params::${JSON.stringify({ menuItemsPayload }, null, 2)}`
    )
    const menuItems = await updateItem(TABLE_MENU_ITEMS, menuItemsPayload)
    console.log(menuItems)

    return handleResponse(true, 200, 'Update Menu Items Success', {menu_item: menuItems})
  } catch (error) {
    return handleErrorResponse(error, 'updateMenuItem')
  }
}


module.exports = {
  getMenuItemById,
  getMenuItemsByIds,
  getMenuItemsByName,
  createMenuItems,
  getMenuItems,
  getMenuItemsByCatId,
  getMenuItemsByRestaurantId,
  updateMenuItem
}
