/* eslint-disable @typescript-eslint/dot-notation */
import { handler as graphqlHandler } from './services/getGraphQLHandler';
import { APIGatewayProxyEvent, Context, Callback, APIGatewayProxyCallback } from 'aws-lambda';
import { isAuthorized } from './authorizer';

interface GraphqlContext extends Context {
  authorization?: any;
}

exports.handler = async (
  event: APIGatewayProxyEvent,
  context: GraphqlContext,
  callback: Callback<APIGatewayProxyCallback>
) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Update this as needed, e.g., 'http://localhost:3000'
    'Access-Control-Allow-Headers':
      'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,origin_app',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Ensure event.path is defined
  if (event.path && event.path === '/graphql') {
    // console.log('INFO: event', event.headers);
    const authProfile: any = event.headers['Authorization']
      ? await isAuthorized(event.headers['Authorization'])
      : null;

    if (event.headers.origin_app === 'vendor' && (!authProfile?.email || !authProfile?.profile)) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Unauthorized'
        })
      };
    }

    context.authorization = authProfile;

    const response = await graphqlHandler(event, context, callback);

    return {
      ...response,
      headers: {
        ...corsHeaders
      }
    };
  } else {
    // Handle unknown routes
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Not Found' })
    };
  }
};
