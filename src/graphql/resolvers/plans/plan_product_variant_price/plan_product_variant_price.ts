import { GraphQLError } from 'graphql';
import { prisma } from '../../../services/prisma';
import { filterShippingZoneCountry } from '../../../helpers/filter';

import {
  getActor,
  isActorAuthorisedPlanProductVariant,
  isActorAuthorisedPlanProductVariantPrice
} from '../../../helpers/auth';

// Queries
const getPlanProductVariantPrice = async (parent: any, { id }: any, context: any, info: any) => {
  try {
    // eslint-disable-next-line @typescript-eslint/return-await
    const planProduct = await prisma.plan_product_variant_price.findUnique({
      where: {
        id
      }
    });

    return planProduct;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const getPlanProductVariantPriceList = async (parent: any, args: any, context: any, info: any) => {
  try {
    const consumerDomain = process.env.APP_CONSUMER_DOMAIN;
    // eslint-disable-next-line @typescript-eslint/return-await
    const planProductPrice = await prisma.plan_product_variant_price.findMany({
      where: {
        ...(context.origin === consumerDomain &&
          (await filterShippingZoneCountry(parent.company_id))),
        plan_product_variant_id: parent.id
      },
      include: {
        plan_product_variant: true
      }
    });
    return planProductPrice;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const getPlanProductVariantPriceAmountWithDiscount = async (
  parent: any,
  args: any,
  context: any,
  info: any
) => {
  const plan = parent.plan_product_variant
    ? await prisma.plan.findFirst({ where: { id: parent.plan_product_variant.plan_id } })
    : null;
  if (plan?.recurrent_discount_percent && plan.recurrent_discount_percent > 0) {
    return (
      Math.round((parent.amount - (parent.amount * plan.recurrent_discount_percent) / 100) * 100) /
      100
    );
  }
  return null;
};

// Mutations

const createPlanProductVariantPrice = async (parent: any, data: any, context: any, info: any) => {
  try {
    const actor = await getActor(context.actor);
    await isActorAuthorisedPlanProductVariant(context.group, actor, data.plan_product_variant_id);

    const newPlanProductVariantPrice = await prisma.plan_product_variant_price.create({
      data: {
        ...data,
        actor: actor.id
      }
    });
    return newPlanProductVariantPrice;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const updatePlanProductVariantPrice = async (
  parent: any,
  { id, ...data }: any,
  context: any,
  info: any
) => {
  try {
    const actor = await getActor(context.actor);
    await isActorAuthorisedPlanProductVariantPrice(context.group, actor, id);

    const updatedPlanProductVariantPrice = await prisma.plan_product_variant_price.update({
      where: {
        id
      },
      data: {
        ...data,
        actor: actor.id
      }
    });
    return updatedPlanProductVariantPrice;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const deletePlanProductVariantPrice = async (parent: any, { id }: any, context: any, info: any) => {
  try {
    const actor = await getActor(context.actor);
    await isActorAuthorisedPlanProductVariantPrice(context.group, actor, id);

    const deletedPlanProductVariantPrice = await prisma.plan_product_variant_price.delete({
      where: {
        id
      }
    });
    return deletedPlanProductVariantPrice;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

export const planProductVariantPriceQueries = {
  getPlanProductVariantPrice
};

export const planProductVariantPriceChildren = {
  getPlanProductVariantPriceList,
  getPlanProductVariantPriceAmountWithDiscount
};

export const planProductVariantPriceMutations = {
  createPlanProductVariantPrice,
  updatePlanProductVariantPrice,
  deletePlanProductVariantPrice
};
