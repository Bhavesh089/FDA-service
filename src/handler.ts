import { APIGatewayEvent, Context, Callback } from 'aws-lambda';

export const queryHandler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  // Simulate a database query
  const data = {
    message: "Query successful",
    items: ["item1", "item2", "item5"],
  };
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
