/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { GraphQLScalarType, Kind } from 'graphql';
import { userQueries, userMutations } from './users';
import { addressQueries, addressMutations } from './address';

const resolvers = {
  Query: {
    ...userQueries,
    ...addressQueries
  },
  Mutation: {
    ...userMutations,
    ...addressMutations
  },
  User: {
    __resolveReference: async (user, context, info) => {
      return await userQueries.getUser(null, { id: user.id }, context, info);
    },
    cart: (parent) => {
      return { user_id: parent.id };
    }
  },
  Address: {
    async __resolveReference(address, context, info) {
      return await addressQueries.getAddress(null, { id: address.id }, context, info);
    }
  },
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'DateTime custom scalar type',
    parseValue(value: any) {
      return new Date(value); // value from the client
    },
    serialize(value: any) {
      return value;
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value);
      }
      return null;
    } // value sent to the client
  }),
  BigInt: new GraphQLScalarType({
    name: 'BigInt',
    description: 'BigInt custom scalar type',
    serialize(value: any) {
      return parseInt(value.toString()); // Convert outgoing integer to string
    },
    parseValue(value: any) {
      return parseInt(value); // Convert incoming string to integer
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value); // Convert AST string to integer
      }
      return null;
    }
  }),
  SignedUrl: new GraphQLScalarType({
    name: 'SignedUrl',
    description: 'SignedUrl custom scalar type',
    parseValue(value) {
      return value;
    },
    async serialize(value) {
      const cloudfrontDistributionDomain = process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN ?? '';
      const url = `${cloudfrontDistributionDomain ?? ''}/${value}`;
      return url;
    }
  }),
  KindEnum: {
    SEND: 'send',
    VERIFY: 'verify'
  }
};

export default resolvers;
