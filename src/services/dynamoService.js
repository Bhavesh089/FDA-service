const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const _ = require('lodash');  // Import lodash
const { validateUsers } = require('../model/userModel');
const { v4: uuidv4 } = require('uuid');

const buildExpression = (conditions, validOperators) => {
  const filterExpressions = [];
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  conditions.forEach((condition, index) => {
    const { field, operator, value } = condition;
    
    // Validate field and operator
    if (!field || typeof field !== 'string') {
      throw new Error(`Invalid field in condition: ${JSON.stringify(condition)}`);
    }
    if (!validOperators.includes(operator)) {
      throw new Error(`Invalid operator "${operator}" in condition: ${JSON.stringify(condition)}`);
    }

    // Use placeholder for reserved keywords
    const placeholderField = `#field${index}`;
    const placeholderValue = `:val${index}`;
    expressionAttributeNames[placeholderField] = field;

    if (operator === 'IN') {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error(`Value for "IN" operator must be a non-empty array: ${JSON.stringify(condition)}`);
      }
      // Use "contains" for each value
      const containsChecks = value.map((val, i) => `contains(${placeholderField}, :val${index}_${i})`).join(' OR ');
      filterExpressions.push(`(${containsChecks})`);
      value.forEach((val, i) => {
        expressionAttributeValues[`:val${index}_${i}`] = val;
      });
    } else {
      filterExpressions.push(`${placeholderField} ${operator} ${placeholderValue}`);
      expressionAttributeValues[placeholderValue] = value;
    }
  });

  return { filterExpressions, expressionAttributeValues, expressionAttributeNames };
};

// Optimized query function with filters
const queryItemsWithFilters = async (tableName, primaryKey, filters) => {
  if (!tableName || typeof tableName !== 'string') {
    throw new Error('Invalid table name');
  }
  
  const [partitionKey, partitionValue] = Object.entries(primaryKey)[0];
  if (!partitionKey || !partitionValue) {
    throw new Error('Invalid primary key information');
  }
  
  if (!filters || !filters.conditions || !Array.isArray(filters.conditions)) {
    throw new Error('Filters must include an array of conditions');
  }
  
  const validOperators = ['=', '>', '<', '>=', '<=', '<>', 'IN', 'contains'];
  
  const { filterExpressions, expressionAttributeValues, expressionAttributeNames } = buildExpression(filters.conditions, validOperators);

  // Partition key condition
  const partitionKeyCondition = `#pk = :pkVal`;
  expressionAttributeNames['#pk'] = partitionKey;
  expressionAttributeValues[':pkVal'] = partitionValue;

  const filterExpression = filterExpressions.length > 0 ? filterExpressions.join(` ${filters.operator} `) : null;

  const params = {
    TableName: tableName,
    KeyConditionExpression: partitionKeyCondition,
    FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
  };

  try {
    const result = await dynamoDB.query(params).promise();
    return result.Items;
  } catch (error) {
    throw new Error(`Failed to retrieve items: ${error.message}`);
  }
};

// Optimized scan function with filters
const getItemsWithFilters = async (tableName, filters) => {
  if (!tableName || typeof tableName !== 'string') {
    throw new Error('Invalid table name');
  }

  if (!filters || !filters.conditions || !Array.isArray(filters.conditions)) {
    throw new Error('Filters must include an array of conditions');
  }

  const validOperators = ['=', '>', '<', '>=', '<=', '<>', 'IN', 'contains'];
  
  const { filterExpressions, expressionAttributeValues, expressionAttributeNames } = buildExpression(filters.conditions, validOperators);

  const filterExpression = filterExpressions.length > 0 ? filterExpressions.join(` ${filters.operator} `) : null;

  const params = {
    TableName: tableName,
    FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
  };

  try {
    const result = await dynamoDB.scan(params).promise();
    return result.Items;
  } catch (error) {
    throw new Error(`Failed to retrieve items: ${error.message}`);
  }
};



/**
 * Get an item by ID.
 * @param {string} tableName - The name of the DynamoDB table.
 * @param {string} idKey - The key name for the ID.
 * @param {string|number} idValue - The ID value to look for.
 * @returns {Promise<Object>} The retrieved item.
 */
const getItemById = async (tableName, idKey, idValue) => {
  const params = {
    TableName: tableName,
    Key: {
      [idKey]: idValue,
    },
  };
  const result = await dynamoDB.get(params).promise();
  return result.Item;
};

/**
 * Put an item (create or update).
 * @param {string} tableName - The name of the DynamoDB table.
 * @param {Object} item - The item to put into the table.
 * @returns {Promise<void>}
 */
const putItem = async (tableName, item) => {
  const params = {
    TableName: tableName,
    Item: item,
  };
  await dynamoDB.put(params).promise();
};


/**
 * Generic put operation to handle single or bulk create items into DynamoDB.
 * @param {string} tableName - The name of the DynamoDB table.
 * @param {Object|Array<Object>} items - Single item or array of items to be inserted.
 * @returns {Promise<Object>} The result of the put operation.
 */
const createItems = async (tableName, items, entity) => {
  // Check if items is an array for bulk create

  const {error} = validateUsers(items);
  if (error) {
    console.log()
    throw new Error(`Validation failed: ${error.details.map(err => err.message).join(', ')}`);
}

  items = addUUIDToItems(items, entity);
    console.log(items, 'this is items-->')
  if (Array.isArray(items)) {
    const chunks = _.chunk(items, 25); // DynamoDB batch write supports up to 25 items at a time
    const results = [];

    for (const chunk of chunks) {
      const params = {
        RequestItems: {
          [tableName]: chunk.map(item => ({
            PutRequest: {
              Item: item,
            },
          })),
        },
      };

      try {
        const result = await dynamoDB.batchWrite(params).promise();
        results.push(result);
        if (result.UnprocessedItems && result.UnprocessedItems[tableName]) {
          console.warn(`Unprocessed items: ${JSON.stringify(result.UnprocessedItems[tableName])}`);
        }
      } catch (error) {
        throw new Error(`Error in batch write: ${error.message}`);
      }
    }

    return results; // Return the results of all batch write operations
  } else {
    // Perform single create
    const params = {
      TableName: tableName,
      Item: items,
    };

    try {
      return await dynamoDB.put(params).promise();
    } catch (error) {
      throw new Error(`Error putting item: ${error.message}`);
    }
  }
};
// Helper function to add UUID to items if not present
const addUUIDToItems = (items, entity) => {
  // If it's a single item, check and add UUID
  if (!Array.isArray(items)) {
      items[`${entity}`] = `${entity}#${uuidv4()}`;
  } else {
    // If it's an array, add UUID to each item that doesn't have one
    items = items.map((item) => {
        console.log(item, 'thjis isitem-->')
        item[`${entity}`] = `${entity}#${uuidv4()}`;
      return item;
    });
  }
  return items;
};

// /**
//  * Generic put operation to handle single or bulk create items into DynamoDB.
//  * @param {string} tableName - The name of the DynamoDB table.
//  * @param {Object|Array<Object>} items - Single item or array of items to be inserted.
//  * @returns {Promise<Object>} The result of the put operation.
//  */
// const createItems = async (tableName, items, entity) => {
//   // Add UUID to the item(s) if missing
//   items = addUUIDToItems(items, entity);

//   // Validate items (assume validateUsers function exists)
//   const { error } = validateUsers(items);
//   if (error) {
//     throw new Error(`Validation failed: ${error.details.map(err => err.message).join(', ')}`);
//   }

//   if (Array.isArray(items)) {
//     // Perform bulk create using Lodash's chunk (DynamoDB batch write supports up to 25 items at a time)
//     const chunks = _.chunk(items, 25); 
//     const results = [];

//     for (const chunk of chunks) {
//       const params = {
//         RequestItems: {
//           [tableName]: chunk.map(item => ({
//             PutRequest: {
//               Item: item,
//             },
//           })),
//         },
//       };
//       console.log(params.RequestItems['fda-users'], 'this is params-->')
//       try {
//         const result = await dynamoDB.batchWrite(params).promise();
//         results.push(result);
//         if (result.UnprocessedItems && result.UnprocessedItems[tableName]) {
//           console.warn(`Unprocessed items: ${JSON.stringify(result.UnprocessedItems[tableName])}`);
//         }
//       } catch (error) {
//         throw new Error(`Error in batch write: ${error.message}`);
//       }
//     }

//     return results; // Return the results of all batch write operations
//   } else {
//     // Perform single create
//     const params = {
//       TableName: tableName,
//       Item: items,
//     };

//     try {
//         console.log(params, 'this is params-->')
//       return await dynamoDB.put(params).promise();
//     } catch (error) {
//       throw new Error(`Error putting item: ${error.message}`);
//     }
//   }
// };
  
/**
 * Delete an item.
 * @param {string} tableName - The name of the DynamoDB table.
 * @param {string} idKey - The key name for the ID.
 * @param {string|number} idValue - The ID value to delete.
 * @returns {Promise<void>}
 */
const deleteItem = async (tableName, idKey, idValue) => {
  const params = {
    TableName: tableName,
    Key: {
      [idKey]: idValue,
    },
  };
  await dynamoDB.delete(params).promise();
};


/**
 * Perform a dynamic query on the DynamoDB table based on foreign key and filters.
 * @param {string} tableName - The name of the DynamoDB table.
 * @param {string|null} foreignKey - The name of the foreign key (optional).
 * @param {string|null} foreignKeyValue - The value of the foreign key (optional).
 * @param {Object} filters - An object containing additional filters (optional).
 * @returns {Promise<Array>} The list of queried items or all items if no key is provided.
 */
const queryByForeignKey = async (tableName, foreignKey = null, foreignKeyValue = null, filters = {}) => {
    const params = {
      TableName: tableName,
    };
  
    // If a foreign key is provided, we will use it for querying.
    if (foreignKey && foreignKeyValue) {
      params.FilterExpression = `${foreignKey} = :foreignKeyValue`;
      params.ExpressionAttributeValues = {
        ':foreignKeyValue': foreignKeyValue,
      };
    }
  
    // Add dynamic filters if provided
    if (filters && Object.keys(filters).length > 0) {
      const filterExpressions = [];
      const expressionAttributeValues = params.ExpressionAttributeValues || {};
  
      for (const [key, value] of Object.entries(filters)) {
        let placeholder = `:${key}`;
        
        // Determine the filter type
        if (Array.isArray(value)) {
          filterExpressions.push(`${key} IN ${placeholder}`); // Handle IN clause
          expressionAttributeValues[placeholder] = value;
        } else if (typeof value === 'object' && value !== null) {
          if (value.hasOwnProperty('between')) {
            // Handle BETWEEN clause
            const [val1, val2] = value.between;
            filterExpressions.push(`${key} BETWEEN :val1 AND :val2`);
            expressionAttributeValues[':val1'] = val1;
            expressionAttributeValues[':val2'] = val2;
          } else if (value.hasOwnProperty('gt')) {
            filterExpressions.push(`${key} > :gt`);
            expressionAttributeValues[':gt'] = value.gt;
          } else if (value.hasOwnProperty('lt')) {
            filterExpressions.push(`${key} < :lt`);
            expressionAttributeValues[':lt'] = value.lt;
          } else if (value.hasOwnProperty('eq')) {
            filterExpressions.push(`${key} = :eq`);
            expressionAttributeValues[':eq'] = value.eq;
          }
        } else {
          // Handle simple equality filter
          filterExpressions.push(`${key} = ${placeholder}`);
          expressionAttributeValues[placeholder] = value;
        }
      }
  
      // Combine filters
      if (params.FilterExpression) {
        params.FilterExpression += ' AND ' + filterExpressions.join(' AND ');
      } else {
        params.FilterExpression = filterExpressions.join(' AND ');
      }
  
      params.ExpressionAttributeValues = { ...expressionAttributeValues };
    }
  
    // Perform the scan with filters applied
    const result = await dynamoDB.scan(params).promise();
    return result.Items;
  };
  
 /**
 * Retrieve multiple items from a DynamoDB table based on an object of fields and their values.
 * @param {string} tableName - The name of the DynamoDB table.
 * @param {Object} fieldValues - An object where the keys are field names and the values are arrays of corresponding field values.
 * @returns {Promise<Array>} The list of retrieved items.
 */
const getByItemIds = async (tableName, fieldValues) => {
    if (typeof fieldValues !== 'object' || Array.isArray(fieldValues)) {
      throw new Error("fieldValues must be an object with field names as keys and arrays of values.");
    }
  
    // Validate that all values in fieldValues are arrays
    const keys = [];
    for (const [field, values] of Object.entries(fieldValues)) {
      if (!Array.isArray(values)) {
        throw new Error(`The value for field "${field}" must be an array.`);
      }
  
      // For each value in the array, create an object where the field is the key
      values.forEach(value => {
        keys.push({ [field]: value });
      });
    }
  
    const params = {
      RequestItems: {
        [tableName]: {
          Keys: keys,
        },
      },
    };
  
    try {
      const result = await dynamoDB.batchGet(params).promise();
      return result.Responses[tableName] || [];
    } catch (error) {
      throw new Error(`Error retrieving items: ${error.message}`);
    }
  };


  const updateItem = async (tableName, item, keys) => {
    // Validate inputs
    if (!tableName || typeof tableName !== 'string') {
      throw new Error('Invalid table name');
    }
    
    if (!item || typeof item !== 'object') {
      throw new Error('Invalid item data');
    }
     // Specify your key names as required (replace 'PrimaryKey', 'SortKey')
  
    const keyValues = {};
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
  
    // Loop through item properties and handle keys separately
    for (const [key, value] of Object.entries(item)) {
      if (keys.includes(key)) {
        // Add primary and sort key to the key values
        keyValues[key] = value;
      } else {
        // Add non-key attributes to UpdateExpression
        const attributePlaceholder = `#${key}`;
        const valuePlaceholder = `:${key}`;
        updateExpressions.push(`${attributePlaceholder} = ${valuePlaceholder}`);
        expressionAttributeNames[attributePlaceholder] = key;
        expressionAttributeValues[valuePlaceholder] = value;
      }
    }
  
    // if (Object.keys(keyValues).length === 0) {
    //   throw new Error('Primary key(s) not provided in the item');
    // }
  
    const params = {
      TableName: tableName,
      Key: keyValues, // Provide the primary key values for identifying the record
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW', // Return the updated item
    };
  
    try {
      const result = await dynamoDB.update(params).promise();
      return result.Attributes; // Return the updated attributes
    } catch (error) {
      throw new Error(`Failed to update item: ${error.message}`);
    }
  };


  const bulkUpdateItems = async (tableName, items) => {
    // Validate inputs
    if (!tableName || typeof tableName !== 'string') {
      throw new Error('Invalid table name');
    }
  
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid items array');
    }
  
    const transactItems = items.map(item => {
      const keys = ['PrimaryKey', 'SortKey']; // Specify your key names (replace 'PrimaryKey', 'SortKey')
  
      const keyValues = {};
      const updateExpressions = [];
      const expressionAttributeNames = {};
      const expressionAttributeValues = {};
  
      // Construct key and update expressions for each item
      for (const [key, value] of Object.entries(item)) {
        if (keys.includes(key)) {
          keyValues[key] = value;
        } else {
          const attributePlaceholder = `#${key}`;
          const valuePlaceholder = `:${key}`;
          updateExpressions.push(`${attributePlaceholder} = ${valuePlaceholder}`);
          expressionAttributeNames[attributePlaceholder] = key;
          expressionAttributeValues[valuePlaceholder] = value;
        }
      }
  
      if (Object.keys(keyValues).length === 0) {
        throw new Error(`Primary key(s) not provided for item: ${JSON.stringify(item)}`);
      }
  
      return {
        Update: {
          TableName: tableName,
          Key: keyValues,
          UpdateExpression: `SET ${updateExpressions.join(', ')}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValuesOnConditionCheckFailure: 'NONE',
        },
      };
    });
  
    // Perform the transaction
    const params = {
      TransactItems: transactItems,
    };
  
    try {
      const result = await dynamoDB.transactWrite(params).promise();
      return result;
    } catch (error) {
      throw new Error(`Bulk update failed: ${error.message}`);
    }
  };
  
  

  

module.exports = {
  getItemById,
  getByItemIds,
  putItem,
  deleteItem,
  queryByForeignKey,
  createItems,
  getItemsWithFilters,
  queryItemsWithFilters,
  updateItem,
  bulkUpdateItems
};
