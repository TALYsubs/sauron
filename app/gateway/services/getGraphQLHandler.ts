/* eslint-disable @typescript-eslint/naming-convention */
import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';
import { startServerAndCreateLambdaHandler, handlers } from '@as-integrations/aws-lambda';
import logPlugin from '../plugins/log-plugin';
import { getSupergraph } from './getSupergraph';
import { localSuperGraph } from './localSuperGraph';

let graphQLHandler: any = null;

const getGraphQLHandlerSingleton = () => {
  if (graphQLHandler) {
    return graphQLHandler;
  }

  const gateway = new ApolloGateway({
    async supergraphSdl() {
      return {
        supergraphSdl: (await localSuperGraph()) as string
      };
    },
    buildService({ url }) {
      const remoteGraphQLDataSource = new RemoteGraphQLDataSource({
        url,
        willSendRequest({ request, context }) {
          if (context.authorization && request.http) {
            request.http.headers.set('origin', context.origin_request);
            request.http.headers.set('actor', context.authorization.email);
            request.http.headers.set('group', context.authorization.profile);
          }
        }
      });
      return remoteGraphQLDataSource;
    }
  });

  const apollo = new ApolloServer({
    gateway,
    plugins: [logPlugin],
    formatError: (formattedError) => {
      if (process.env.ENVIRONMENT === 'prod' && formattedError.extensions?.stacktrace) {
        delete formattedError.extensions.stacktrace;
      }
      return { ...formattedError };
    }
  });

  graphQLHandler = startServerAndCreateLambdaHandler(
    apollo,
    handlers.createAPIGatewayProxyEventRequestHandler(),
    {
      context: async ({ event, context }) => {
        const origin_request = event.headers.origin_app;
        return {
          ...context,
          origin_request
        };
      }
    }
  );

  return graphQLHandler;
};

export const handler = async (event, context, callback) => {
  try {
    const graphQLHandlerSingleton = getGraphQLHandlerSingleton();
    const result = await graphQLHandlerSingleton(event, context, callback);
    return result;
  } catch (error) {
    console.error('Error during Apollo Server startup:', error);
    throw new Error('Apollo Server startup failed');
  }
};
