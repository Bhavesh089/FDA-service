const fs = require('fs')
const path = require('path');
const { getItemById, createItems, getByItemIds, getItemsWithFilters, queryItemsWithFilters } = require('../services/dynamoService');
const { validateUser } = require('../model/userModel');

async function getUserById({id}){
    // console.log(email, "this is email->")
    const user = await getItemById("fda-users", "UserID", id)
    console.log(user, 'this is user')
    return user
}
  
const createUser = async (userPayload) => {
    try {
      const result = await createItems("fda-users", userPayload, 'user');
         console.log(result, 'this is the result')
      return result
    } catch (error) {
        console.log(error, 'this is the error'
        )
      return { statusCode: 400, body: JSON.stringify({ error: error.message }) };
    }
  };


  const getUserByIds= async ({UserID}) => {
    try {
      const result = await getByItemIds("fda-users", {"UserID": UserID});
        console.log(result, 'this is the result')
      return result
    } catch (error) {
        console.log(error, 'this is the error'
        )
      return { statusCode: 400, body: JSON.stringify({ error: error.message }) };
    }
  };

  const queryUsers = async({primaryKey={}, filters = {}}) => {
    try {
        // console.log(primaryKey, filters, "this is filters-->")
        const result = await getItemsWithFilters("fda-users", filters);
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
          console.log(error, 'this is the error'
          )
        return { statusCode: 400, body: JSON.stringify({ error: error.message }) };
      }
  }


  
module.exports = {
    getUserById,
    createUser,
    getUserByIds,
    queryUsers,
}