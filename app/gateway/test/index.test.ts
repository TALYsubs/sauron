/* eslint-disable @typescript-eslint/return-await */
import { describe, it, expect } from 'vitest';
import { handler } from '../services/getGraphQLHandler';

describe('lambda function', () => {
  it('is IntrospectionQuery responding', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/graphql',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          query IntrospectionQuery {
            __schema {
              queryType {
                name
              }
            }
          }
        `
      })
    };
    const context = {};

    const response = await handler(event, context, () => console.log('callback'));
    delete response?.headers;
    response.body = response.body.trim();

    const expectedResponse = {
      statusCode: 200,
      body: JSON.stringify({
        data: {
          __schema: {
            queryType: {
              name: 'Query'
            }
          }
        }
      })
    };
    expect(response).toEqual(expectedResponse);
  });
});
