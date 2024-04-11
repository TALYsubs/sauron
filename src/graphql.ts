/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable n/no-path-concat */
import { ApolloServer } from '@apollo/server';
import { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import resolvers from './graphql/resolvers';
import { buildSubgraphSchema } from '@apollo/subgraph';
import gql from 'graphql-tag';
import { mergeGraphqlTypes } from './services/graphqlLoader';
import { authDirectiveTransformer } from './services/authDIrective';
import { Context } from './types/global';

export const server = (fastify: any) => {
  const schemas = mergeGraphqlTypes(`${__dirname}/graphql`);

  const typeDefs = gql`
    ${schemas}
  `;

  const initialSchema = buildSubgraphSchema({
    typeDefs,
    resolvers
  });

  const transformedSchema = authDirectiveTransformer(initialSchema);

  const apollo = new ApolloServer<Context>({
    schema: transformedSchema,
    plugins: [fastifyApolloDrainPlugin(fastify)]
  });
  return apollo;
};
