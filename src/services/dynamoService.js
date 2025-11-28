const AWS = require('aws-sdk')
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const _ = require('lodash') // Import lodash
const { v4: uuidv4 } = require('uuid')
const { SERVICE } = require('../constants/constants')

const buildExpression = (conditions, validOperators) => {
  const filterExpressions = []
  const expressionAttributeValues = {}
  const expressionAttributeNames = {}

  conditions.forEach((condition, index) => {
    const { field, operator, value } = condition

    // Validate field and operator
    if (!field || typeof field !== 'string') {
      throw new Error(
        `Invalid field in condition: ${JSON.stringify(condition)}`
      )
    }
    if (!validOperators.includes(operator)) {
      throw new Error(
        `Invalid operator "${operator}" in condition: ${JSON.stringify(condition)}`
      )
    }

    // Use placeholder for reserved keywords
    const placeholderField = `#field${index}`
    const placeholderValue = `:val${index}`
    expressionAttributeNames[placeholderField] = field

    if (operator === 'IN') {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error(
          `Value for "IN" operator must be a non-empty array: ${JSON.stringify(condition)}`
        )
      }
      // Use "contains" for each value
      const containsChecks = value
        .map((val, i) => `contains(${placeholderField}, :val${index}_${i})`)
        .join(' OR ')
      filterExpressions.push(`(${containsChecks})`)
      value.forEach((val, i) => {
        expressionAttributeValues[`:val${index}_${i}`] = val
      })
    } else {
      filterExpressions.push(
        `${placeholderField} ${operator} ${placeholderValue}`
      )
      expressionAttributeValues[placeholderValue] = value
    }
  })

  return {
    filterExpressions,
    expressionAttributeValues,
    expressionAttributeNames,
  }
}

// Optimized query function with filters
const queryItemsWithFilters = async (tableName, primaryKey, filters, sortKey = null) => {
    if (!tableName || typeof tableName !== 'string') {
      throw new Error('Invalid table name');
    }
  
    // Extract partition key
    const [partitionKey, partitionValue] = Object.entries(primaryKey)[0];
    if (!partitionKey || !partitionValue) {
      throw new Error('Partition key information is required');
    }
  
    // Check if filters are properly defined
    if (!filters || !filters.conditions || !Array.isArray(filters.conditions)) {
      throw new Error('Filters must include an array of conditions');
    }
  
    const validOperators = ['=', '>', '<', '>=', '<=', '<>', 'IN', 'contains'];
  
    const {
      filterExpressions,
      expressionAttributeValues,
      expressionAttributeNames,
    } = buildExpression(filters.conditions, validOperators);
  
    // Partition key condition (compulsory)
    const keyConditionExpressions = [`#pk = :pkVal`];
    expressionAttributeNames['#pk'] = partitionKey;
    expressionAttributeValues[':pkVal'] = partitionValue;
  
    // Sort key condition (optional)
    if (sortKey) {
      const [sortKeyName, sortKeyValue] = Object.entries(sortKey)[0];
      if (sortKeyName && sortKeyValue) {
        keyConditionExpressions.push(`#sk = :skVal`);
        expressionAttributeNames['#sk'] = sortKeyName;
        expressionAttributeValues[':skVal'] = sortKeyValue;
      }
    }
  
    const filterExpression =
      filterExpressions.length > 0
        ? filterExpressions.join(` ${filters.operator} `)
        : null;
  
    const params = {
      TableName: tableName,
      KeyConditionExpression: keyConditionExpressions.join(' AND '), // Partition key and optional sort key
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

  /**
 * Fetch items from a DynamoDB table using filters and an optional GSI indexed value.
 *
 * @param {string} tableName - The name of the DynamoDB table.
 * @param {Object} [filters] - The filter conditions to apply (optional).
 * @param {string} [indexName] - The name of the Global Secondary Index (GSI) to query (optional).
 * @param {string} [gsiKey] - The key of the GSI indexed field (optional).
 * @param {string|number} [gsiValue] - The value of the GSI indexed field (optional).
 * @returns {Promise<Array>} The list of items that match the filters or GSI value.
 * @throws {Error} If the table name is invalid.
 */
const getItemsWithFilters = async (tableName, filters = null, gsiKey = null, gsiValue = null) => {
    tableName = `${SERVICE}-${tableName}`
    console.log(filters, 'this is filters-->')
    console.log(gsiKey, gsiValue, 'this is value--->')
    if (!tableName || typeof tableName !== 'string') {
      throw new Error('Invalid table name');
    }

    const params = {
      TableName: tableName,
    };

    // console.log( filters.filters.conditions, 'again')
    // If filters are provided, build the filter expressions
    if (filters && filters.conditions && Array.isArray(filters.conditions)) {

      const validOperators = ['=', '>', '<', '>=', '<=', '<>', 'IN', 'contains'];

      const {
        filterExpressions,
        expressionAttributeValues,
        expressionAttributeNames,
      } = buildExpression(filters.conditions, validOperators);

      const filterExpression =
        filterExpressions.length > 0
          ? filterExpressions.join(` ${filters.operator} `)
          : null;

      if (filterExpression) {
        params.FilterExpression = filterExpression;
        params.ExpressionAttributeValues = expressionAttributeValues;
        params.ExpressionAttributeNames = expressionAttributeNames;
      }
    }

    // If a GSI index and value are provided, modify the query accordingly
    if (gsiKey && gsiValue !== null) {
      params.IndexName = `${gsiKey}-index`;
      params.KeyConditionExpression = `${gsiKey} = :gsiValue`;
      params.ExpressionAttributeValues = {
        ...params.ExpressionAttributeValues, // Merge with existing values if filters are used
        ':gsiValue': gsiValue
      };
    }
    console.log(params, 'params-->')
    try {
      // Use query if GSI is specified, otherwise perform a scan
      const result = gsiKey && gsiValue !== null
        ? await dynamoDB.query(params).promise()
        : await dynamoDB.scan(params).promise();
        console.log(result, 'this is result')
      return result.Items;
    } catch (error) {
      throw new Error(`Failed to retrieve items: ${error.message}`);
    }
  };

// /**
//  * Fetch items from a DynamoDB table using filters and an optional GSI indexed value.
//  *
//  * @param {string} tableName - The name of the DynamoDB table.
//  * @param {Object} filters - The filter conditions to apply.
//  * @param {string} [indexName] - The name of the Global Secondary Index (GSI) to query (optional).
//  * @param {string} [gsiKey] - The key of the GSI indexed field (optional).
//  * @param {string|number} [gsiValue] - The value of the GSI indexed field (optional).
//  * @returns {Promise<Array>} The list of items that match the filters or GSI value.
//  * @throws {Error} If the table name or filters are invalid.
//  */
// const getItemsWithFilters = async (tableName, filters, gsiKey = null, gsiValue = null) => {
//     if (!tableName || typeof tableName !== 'string') {
//       throw new Error('Invalid table name');
//     }
  
//     if (!filters || !filters.conditions || !Array.isArray(filters.conditions)) {
//       throw new Error('Filters must include an array of conditions');
//     }
  
//     const validOperators = ['=', '>', '<', '>=', '<=', '<>', 'IN', 'contains'];
  
//     const {
//       filterExpressions,
//       expressionAttributeValues,
//       expressionAttributeNames,
//     } = buildExpression(filters.conditions, validOperators);
  
//     const filterExpression =
//       filterExpressions.length > 0
//         ? filterExpressions.join(` ${filters.operator} `)
//         : null;
  
//     const params = {
//       TableName: tableName,
//       FilterExpression: filterExpression,
//       ExpressionAttributeValues: expressionAttributeValues,
//       ExpressionAttributeNames: expressionAttributeNames,
//     };
  
//     // If a GSI index and value are provided, modify the query accordingly
//     if (indexName && gsiKey && gsiValue !== null) {
//       params.IndexName = `${gsiKey}-index`;
//       params.KeyConditionExpression = `${gsiKey} = :gsiValue`;
//       params.ExpressionAttributeValues[':gsiValue'] = gsiValue;
//     }
  
//     try {
//       // Use query if GSI is specified, otherwise perform a scan
//       const result = indexName && gsiKey && gsiValue !== null
//         ? await dynamoDB.query(params).promise()
//         : await dynamoDB.scan(params).promise();
        
//       return result.Items;
//     } catch (error) {
//       throw new Error(`Failed to retrieve items: ${error.message}`);
//     }
//   };

/**
 * Get an item by ID.
 * @param {string} tableName - The name of the DynamoDB table.
 * @param {string} idKey - The key name for the ID.
 * @param {string|number} idValue - The ID value to look for.
 * @returns {Promise<Object>} The retrieved item.
 */
const getItemById = async (tableName, idKey, idValue, sortKey) => {
  tableName = `${SERVICE}-${tableName}`
  const params = {
    TableName: tableName,
    Key: {
      [idKey]: idValue,
    },
  }
  if (sortKey) {
    params.Key["type"] = sortKey;
  }

  console.log('Params from the get by id', params )
  const result = await dynamoDB.get(params).promise()
  return result.Item
}

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
  }
  await dynamoDB.put(params).promise()
}

/**
 * Generic put operation to handle single or bulk create items into DynamoDB.
 * @param {string} tableName - The name of the DynamoDB table.
 * @param {Object|Array<Object>} items - Single item or array of items to be inserted.
 * @returns {Promise<Object>} The result of the put operation.
 */
const createItems = async (tableName, items, validate) => {
  // Check if items is an array for bulk create
  tableName = `${SERVICE}-${tableName}`
  const { error } = validate(items)
  if (error) {
    throw new Error(
      `Validation failed: ${error.details.map((err) => err.message).join(', ')}`
    )
  }

  items = addUUIDToItems(items)
  
  if (Array.isArray(items)) {
    // const createdItemIds = items.map(item => item.id || item.uuid);
    const chunks = _.chunk(items, 25) // DynamoDB batch write supports up to 25 items at a time
    const results = []
    const unprocessedOrderIds = [];
    for (const chunk of chunks) {
      const params = {
        RequestItems: {
          [tableName]: chunk.map((item) => ({
            PutRequest: {
              Item: item,
            },
          })),
        },
      }

      try {
        const result = await dynamoDB.batchWrite(params).promise()
        const unprocessedItems = result.UnprocessedItems[tableName];

        if (result.UnprocessedItems && result.UnprocessedItems[tableName]) {
          unprocessedItems.forEach((unprocessed) => {
            const unprocessedId = unprocessed.PutRequest.Item.id || unprocessed.PutRequest.Item.uuid;
            unprocessedOrderIds.push(unprocessedId); // Collect unprocessed order IDs
          });
          console.warn(
            `Unprocessed items: ${JSON.stringify(result.UnprocessedItems[tableName])}`
          )
        }
      } catch (error) {
        throw new Error(`Error in batch write: ${error.message}`)
      }
    }

    const processedItems = items.filter(id => !unprocessedOrderIds.includes(id));

    console.log(processedItems, 'this is processedItems')
    return {results, processedItems} // Return the results of all batch write operations
  } else {
    // Perform single create
    const params = {
      TableName: tableName,
      Item: items,
    }
    const result = await dynamoDB.put(params).promise()
    console.log(result, 'this is result from the center')
    try {
      return result
    } catch (error) {
      throw new Error(`Error putting item: ${error.message}`)
    }
  }
}
// Helper function to add UUID to items if not present
const addUUIDToItems = (items) => {
  // If it's a single item, check and add UUID
  if (!Array.isArray(items)) {
    items['id'] = `${uuidv4()}`
  } else {
    // If it's an array, add UUID to each item that doesn't have one
    items = items.map((item) => {
      console.log(item, 'thjis isitem-->')
      item['id'] = `${uuidv4()}`
      return item
    })
  }
  return items
}

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
  }
  await dynamoDB.delete(params).promise()
}

/**
 * Perform a dynamic query on the DynamoDB table based on foreign key and filters.
 * @param {string} tableName - The name of the DynamoDB table.
 * @param {string|null} foreignKey - The name of the foreign key (optional).
 * @param {string|null} foreignKeyValue - The value of the foreign key (optional).
 * @param {Object} filters - An object containing additional filters (optional).
 * @returns {Promise<Array>} The list of queried items or all items if no key is provided.
 */
const queryByForeignKey = async (
  tableName,
  foreignKey = null,
  foreignKeyValue = null,
  filters = {}
) => {
  const params = {
    TableName: tableName,
  }

  // If a foreign key is provided, we will use it for querying.
  if (foreignKey && foreignKeyValue) {
    params.FilterExpression = `${foreignKey} = :foreignKeyValue`
    params.ExpressionAttributeValues = {
      ':foreignKeyValue': foreignKeyValue,
    }
  }

  // Add dynamic filters if provided
  if (filters && Object.keys(filters).length > 0) {
    const filterExpressions = []
    const expressionAttributeValues = params.ExpressionAttributeValues || {}

    for (const [key, value] of Object.entries(filters)) {
      let placeholder = `:${key}`

      // Determine the filter type
      if (Array.isArray(value)) {
        filterExpressions.push(`${key} IN ${placeholder}`) // Handle IN clause
        expressionAttributeValues[placeholder] = value
      } else if (typeof value === 'object' && value !== null) {
        if (value.hasOwnProperty('between')) {
          // Handle BETWEEN clause
          const [val1, val2] = value.between
          filterExpressions.push(`${key} BETWEEN :val1 AND :val2`)
          expressionAttributeValues[':val1'] = val1
          expressionAttributeValues[':val2'] = val2
        } else if (value.hasOwnProperty('gt')) {
          filterExpressions.push(`${key} > :gt`)
          expressionAttributeValues[':gt'] = value.gt
        } else if (value.hasOwnProperty('lt')) {
          filterExpressions.push(`${key} < :lt`)
          expressionAttributeValues[':lt'] = value.lt
        } else if (value.hasOwnProperty('eq')) {
          filterExpressions.push(`${key} = :eq`)
          expressionAttributeValues[':eq'] = value.eq
        }
      } else {
        // Handle simple equality filter
        filterExpressions.push(`${key} = ${placeholder}`)
        expressionAttributeValues[placeholder] = value
      }
    }

    // Combine filters
    if (params.FilterExpression) {
      params.FilterExpression += ' AND ' + filterExpressions.join(' AND ')
    } else {
      params.FilterExpression = filterExpressions.join(' AND ')
    }

    params.ExpressionAttributeValues = { ...expressionAttributeValues }
  }

  // Perform the scan with filters applied
  const result = await dynamoDB.scan(params).promise()
  return result.Items
}

/**
 * Retrieve multiple items from a DynamoDB table based on an object of fields and their values.
 * @param {string} tableName - The name of the DynamoDB table.
 * @param {Object} fieldValues - An object where the keys are field names and the values are arrays of corresponding field values.
 * @returns {Promise<Array>} The list of retrieved items.
 */
const getByItemIds = async (tableName, fieldValues, sortKey = null, isGSI=false) => {
    tableName = `${SERVICE}-${tableName}`;
    
    if (typeof fieldValues !== 'object' || Array.isArray(fieldValues)) {
      throw new Error(
        'fieldValues must be an object with field names as keys and arrays of values.'
      );
    }

    if (isGSI) {
        // Handle retrieval using GSI (global secondary index)
        const gsiItems = [];
        for (const [gsiKey, gsiValues] of Object.entries(fieldValues)) {
          if (!Array.isArray(gsiValues)) {
            throw new Error(`The value for GSI field "${gsiKey}" must be an array.`);
          }
    
          for (const gsiValue of gsiValues) {
            const params = {
              TableName: tableName,
              IndexName: `${gsiKey}-index`, // Assuming the GSI name is the same as the field name
              KeyConditionExpression: `${gsiKey} = :gsiValue`,
              ExpressionAttributeValues: {
                ':gsiValue': gsiValue,
              },
            };
    
            try {
              const result = await dynamoDB.query(params).promise();
              gsiItems.push(...result.Items);
            } catch (error) {
              throw new Error(`Error retrieving items by GSI "${gsiKey}": ${error.message}`);
            }
          }
        }
    
        return gsiItems;
      }
  
    // Validate that all values in fieldValues are arrays
    const keys = [];
    for (const [field, values] of Object.entries(fieldValues)) {
      if (!Array.isArray(values)) {
        throw new Error(`The value for field "${field}" must be an array.`);
      }
  
      // For each value in the array, create an object where the field is the key
      values.forEach((value) => {
        const keyObject = { [field]: value };
  
        // If sortKey is provided, add it to the keyObject
        if (sortKey && typeof sortKey === 'string') {
          Object.assign(keyObject, {type: sortKey}); // Merge sortKey fields into keyObject
        }
  
        keys.push(keyObject);
      });
    }
    
    console.log(keys, 'this is keys-->')
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
  

//         tableName = `${SERVICE}-${tableName}`
//   if (typeof fieldValues !== 'object' || Array.isArray(fieldValues)) {
//     throw new Error(
//       'fieldValues must be an object with field names as keys and arrays of values.'
//     )
//   }

//   // Validate that all values in fieldValues are arrays
//   const keys = []
//   for (const [field, values] of Object.entries(fieldValues)) {
//     if (!Array.isArray(values)) {
//       throw new Error(`The value for field "${field}" must be an array.`)
//     }

//     // For each value in the array, create an object where the field is the key
//     values.forEach((value) => {
//       keys.push({ [field]: value })
//     })
//   }

//   const params = {
//     RequestItems: {
//       [tableName]: {
//         Keys: keys,
//       },
//     },
//   }
//   try {
//     // console.log(params.RequestItems["fda-orders"].Keys, 'this is params-->')
//     const result = await dynamoDB.batchGet(params).promise()
//     return result.Responses[tableName] || []
//   } catch (error) {
//     throw new Error(`Error retrieving items: ${error.message}`)
//   }
// }

// const updateItem = async (tableName, item, keys) => {
//   // Validate inputs
//   if (!tableName || typeof tableName !== 'string') {
//     throw new Error('Invalid table name')
//   }

//   if (!item || typeof item !== 'object') {
//     throw new Error('Invalid item data')
//   }
//   // Specify your key names as required (replace 'PrimaryKey', 'SortKey')

//   const keyValues = {}
//   const updateExpressions = []
//   const expressionAttributeNames = {}
//   const expressionAttributeValues = {}

//   // Loop through item properties and handle keys separately
//   for (const [key, value] of Object.entries(item)) {
//     if (keys.includes(key)) {
//       // Add primary and sort key to the key values
//       keyValues[key] = value
//     } else {
//       // Add non-key attributes to UpdateExpression
//       const attributePlaceholder = `#${key}`
//       const valuePlaceholder = `:${key}`
//       updateExpressions.push(`${attributePlaceholder} = ${valuePlaceholder}`)
//       expressionAttributeNames[attributePlaceholder] = key
//       expressionAttributeValues[valuePlaceholder] = value
//     }
//   }

//   // if (Object.keys(keyValues).length === 0) {
//   //   throw new Error('Primary key(s) not provided in the item');
//   // }

//   const params = {
//     TableName: tableName,
//     Key: keyValues, // Provide the primary key values for identifying the record
//     UpdateExpression: `SET ${updateExpressions.join(', ')}`,
//     ExpressionAttributeNames: expressionAttributeNames,
//     ExpressionAttributeValues: expressionAttributeValues,
//     ReturnValues: 'ALL_NEW', // Return the updated item
//   }

//   try {
//     const result = await dynamoDB.update(params).promise()
//     return result.Attributes // Return the updated attributes
//   } catch (error) {
//     throw new Error(`Failed to update item: ${error.message}`)
//   }
// }

// const updateItem = async (tableName, item) => {
//     // Validate inputs
//     tableName = `${SERVICE}-${tableName}`
//     if (!tableName || typeof tableName !== 'string') {
//       throw new Error('Invalid table name');
//     }
  
//     if (!item || typeof item !== 'object') {
//       throw new Error('Invalid item data');
//     }
  
//     const keyValues = {};
//     const updateExpressions = [];
//     const expressionAttributeNames = {};
//     const expressionAttributeValues = {};
  
//     // Assume primary keys are already part of the item
//     for (const [key, value] of Object.entries(item)) {
//       if (value === undefined || value === null) {
//         throw new Error(`Invalid value for key: ${key}`);
//       }
  
//       if (typeof value === 'string' || typeof value === 'number') {
//         // Heuristic: treat the first encountered keys as the identifying attributes (this can be based on known PK structure)
//         // In this case, we assume 'id' or keys containing 'Id' (case insensitive) are identifiers
  
//         if (key.toLowerCase().includes('id')) {
//           keyValues[key] = value; // Treat as primary key
//         } else {
//           // Add non-key attributes to UpdateExpression
//           const attributePlaceholder = `#${key}`;
//           const valuePlaceholder = `:${key}`;
//           updateExpressions.push(`${attributePlaceholder} = ${valuePlaceholder}`);
//           expressionAttributeNames[attributePlaceholder] = key;
//           expressionAttributeValues[valuePlaceholder] = value;
//         }
//       } else {
//         throw new Error(`Unsupported type for key: ${key}`);
//       }
//     }
  
//     // Ensure that the key values are extracted
//     if (Object.keys(keyValues).length === 0) {
//       throw new Error('No primary key(s) detected');
//     }
  
//     const params = {
//       TableName: tableName,
//       Key: keyValues, // Use the extracted key values dynamically
//       UpdateExpression: `SET ${updateExpressions.join(', ')}`,
//       ExpressionAttributeNames: expressionAttributeNames,
//       ExpressionAttributeValues: expressionAttributeValues,
//       ReturnValues: 'ALL_NEW', // Return the updated item
//     };
  
//     try {
//       const result = await dynamoDB.update(params).promise();
//       return result.Attributes; // Return the updated attributes
//     } catch (error) {
//       throw new Error(`Failed to update item: ${error.message}`);
//     }
//   };
const updateItem = async (tableName, item, sortkey=null) => {
    // Validate inputs
    tableName = `${SERVICE}-${tableName}`;
    if (!tableName || typeof tableName !== 'string') {
        throw new Error('Invalid table name');
    }

    if (!item || typeof item !== 'object') {
        throw new Error('Invalid item data');
    }

    const keyValues = {};
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    // Assume primary keys are already part of the item
    for (const [key, value] of Object.entries(item)) {
        if (value === undefined || value === null) {
            throw new Error(`Invalid value for key: ${key}`);
        }

        if (typeof value === 'string' || typeof value === 'number'  || typeof value === 'boolean') {
            // Identify primary key
            if (key.toLowerCase() === 'id' || (sortkey && key == 'type' && value.toLowerCase() == sortkey)) {
                keyValues[key] = value;
            } else {
                // Add non-key attributes to UpdateExpression
                const attributePlaceholder = `#${key}`;
                const valuePlaceholder = `:${key}`;
                updateExpressions.push(`${attributePlaceholder} = ${valuePlaceholder}`);
                expressionAttributeNames[attributePlaceholder] = key;
                expressionAttributeValues[valuePlaceholder] = value;
            }
        } else if (Array.isArray(value)) {
            // Handle arrays (like the 'menu' field)
            const attributePlaceholder = `#${key}`;
            const valuePlaceholder = `:${key}`;
            updateExpressions.push(`${attributePlaceholder} = ${valuePlaceholder}`);
            expressionAttributeNames[attributePlaceholder] = key;
            expressionAttributeValues[valuePlaceholder] = value;
        } else {
            throw new Error(`Unsupported type for key: ${key}`);
        }
    }

    const params = {
        TableName: tableName,
        Key: keyValues, // Provide the primary key values for identifying the record
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW', // Return the updated item
    };
    
    console.log(params, 'this is params-->')
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
    throw new Error('Invalid table name')
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Invalid items array')
  }

  const transactItems = items.map((item) => {
    const keys = ['PrimaryKey', 'SortKey'] // Specify your key names (replace 'PrimaryKey', 'SortKey')

    const keyValues = {}
    const updateExpressions = []
    const expressionAttributeNames = {}
    const expressionAttributeValues = {}

    // Construct key and update expressions for each item
    for (const [key, value] of Object.entries(item)) {
      if (keys.includes(key)) {
        keyValues[key] = value
      } else {
        const attributePlaceholder = `#${key}`
        const valuePlaceholder = `:${key}`
        updateExpressions.push(`${attributePlaceholder} = ${valuePlaceholder}`)
        expressionAttributeNames[attributePlaceholder] = key
        expressionAttributeValues[valuePlaceholder] = value
      }
    }

    if (Object.keys(keyValues).length === 0) {
      throw new Error(
        `Primary key(s) not provided for item: ${JSON.stringify(item)}`
      )
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
    }
  })

  // Perform the transaction
  const params = {
    TransactItems: transactItems,
  }

  try {
    const result = await dynamoDB.transactWrite(params).promise()
    return result
  } catch (error) {
    throw new Error(`Bulk update failed: ${error.message}`)
  }
}

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
  bulkUpdateItems,
}
