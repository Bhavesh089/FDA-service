const {
    handleResponse,
    handleErrorResponse,
  } = require('../lib/controller-utils')
  const {TABLE_CATEGORY, validateCategory } = require('../model/category-model')
  const {
    getItemsWithFilters,
    createItems,
    updateItem
  } = require('../services/dynamoService')
  
  
  const createCategory = async (categoryPayload) => {
    try {
      console.log(
        `createCategory::Params::${{ userPayload: JSON.stringify(categoryPayload, null, 2) }}`
      )
      const result = await createItems(TABLE_CATEGORY, categoryPayload, validateCategory)
      console.log(result)
  
      return handleResponse(true, 201, 'Create Category Success', result)
    } catch (error) {
      return handleErrorResponse(error, 'createCategory')
    }
  }

 
  const getCategories = async (params) => {
    try {
      console.log(
        `getCategories::Params::${{ category: JSON.stringify(params, null, 2) }}`
      )
      const result = await getItemsWithFilters(TABLE_CATEGORY, {})
      console.log(result)
  
      return handleResponse(true, 200, 'Get categories Success', {categories: result})
    } catch (error) {
      return handleErrorResponse(error, 'categories')
    }
  }
  
  const updateCategory = async (categoryPayload) => {
    try {
      console.log(
        `updateCategory::Params::${JSON.stringify({ categoryPayload }, null, 2)}`
      )
      const category = await updateItem(TABLE_CATEGORY, categoryPayload)
      console.log(category)
  
      return handleResponse(true, 200, 'Update Category Success', {category})
    } catch (error) {
      return handleErrorResponse(error, 'updateCategory')
    }
  }

  module.exports = {
    createCategory,
    getCategories,
    updateCategory
  }
  