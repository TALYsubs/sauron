/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { GraphQLScalarType, Kind } from 'graphql';
import { planQueries, planMutations } from './plan';
import { categoryMutations, categoryQueries } from './categories';
import { planPriceChildren, planPriceMutations, planPriceQueries } from './plan_price';
import {
  planProductVariantPriceChildren,
  planProductVariantPriceMutations,
  planProductVariantPriceQueries
} from './plan_product_variant_price';
import { planFeatureMutations, planFeatureQueries, planFeatureChildren } from './plan_feature';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';
import {
  planProductVariantChildren,
  planProductVariantMutations,
  planProductVariantQueries
} from './plan_product_variant';
import { trialChildren } from './trial';

const planResolvers = {
  Query: {
    ...planQueries,
    ...categoryQueries,
    ...planPriceQueries,
    ...planProductVariantPriceQueries,
    ...planFeatureQueries
  },
  Mutation: {
    ...planMutations,
    ...categoryMutations,
    ...planPriceMutations,
    ...planProductVariantPriceMutations,
    ...planFeatureMutations,
    ...planProductVariantMutations
  },
  Plan: {
    async __resolveReference(plan, context) {
      return await planQueries.getPlan(null, { id: plan.id }, context, null);
    },
    features: async (parent: any, args: any, context: any, info: any) =>
      planFeatureChildren.getPlanFeatureList(parent, args, context, info),
    prices: async (parent: any, args: any, context: any, info: any) =>
      planPriceChildren.getPlanPriceList(parent, args, context, info),
    products: async (parent: any, args: any, context: any, info: any) =>
      planProductVariantChildren.getPlanProductVariantList(parent, args, context, info),
    bundle_definition: async (parent: any, args: any, context: any, info: any) =>
      planFeatureChildren.bundleDefinition(parent, args, context, info),
    user_purchases: async (parent: any, args: any, context: any, info: any) =>
      trialChildren.getTotalByUser(parent, args, context, info)
  },
  PlanProductVariant: {
    async __resolveReference(planProductVariant, context) {
      console.log('at resover reference');
      const planProductVariantObject = await planProductVariantQueries.getPlanProductVariant(
        planProductVariant,
        null,
        context,
        null
      );
      return planProductVariantObject;
    },
    media: async (parent: any, args: any, context: any, info: any) =>
      planProductVariantChildren.getProductVariantMedia(parent, args, context, info),
    productPrice: async (parent: any, args: any, context: any, info: any) =>
      planProductVariantPriceChildren.getPlanProductVariantPriceList(parent, args, context, info)
  },
  PlanPrice: {
    async __resolveReference(planPrice, context) {
      return await planPriceQueries.getPlanPrice(null, { id: planPrice.id }, context, null);
    },
    amount_with_discount: async (parent: any, args: any, context: any, info: any) =>
      planPriceChildren.getPlanPriceAmountWithDiscount(parent, args, context, info)
  },
  PlanFeature: {
    async __resolveReference(planFeature, context) {
      return await planFeatureQueries.getPlanFeature(null, { id: planFeature.id }, context, null);
    }
  },
  PlanProductVariantPrice: {
    async __resolveReference(planProductVariantPrice, context, info) {
      return await planProductVariantPriceQueries.getPlanProductVariantPrice(
        null,
        { id: planProductVariantPrice.id },
        context,
        info
      );
    },
    amount_with_discount: async (parent: any, args: any, context: any, info: any) =>
      planProductVariantPriceChildren.getPlanProductVariantPriceAmountWithDiscount(
        parent,
        args,
        context,
        info
      )
  },
  Category: {
    async __resolveReference(category, context, info) {
      return await categoryQueries.getCategory(null, { id: category.id }, context, info);
    }
  },
  SectionItem: {
    __resolveType(obj, context, info) {
      if (obj.id && obj.company_id) {
        // Assuming only 'Plan' has 'title' attribute
        return 'Plan';
      }
      if (obj.id && !obj.company_id) {
        // Assuming only 'Company' has 'id' and no 'company_id'
        return 'Company';
      }
      return null; // GraphQLError is thrown
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
  JSON: GraphQLJSON,
  JsonObject: GraphQLJSONObject,
  KindEnum: {
    SEND: 'send',
    VERIFY: 'verify'
  }
};

export default planResolvers;
