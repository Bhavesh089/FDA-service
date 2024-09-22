module.exports.dbQuery = async (event) => {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Query received and processed",
      }),
    };
  };
  