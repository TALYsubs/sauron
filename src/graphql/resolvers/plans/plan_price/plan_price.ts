import { GraphQLError } from 'graphql';
import { prisma } from '../../../services/prisma';
import { getActor, isActorAuthorisedPlan, isActorAuthorisedPlanPrice } from '../../../helpers/auth';
import { filterShippingZoneCountry } from '../../../helpers/filter';

// Queries
const getPlanPrice = async (parent: any, { id }: any, context: any, info: any) => {
  try {
    const query: any = {
      where: {
        id
      },
      include: {
        plan: true
      }
    };

    if (context.group === 'VENDOR') {
      const actor = await getActor(context.actor);
      query.where.plan.company_id = actor.employer_id;
    }

    // eslint-disable-next-line @typescript-eslint/return-await
    const planPrice = await prisma.plan_price.findUnique(query);

    return planPrice;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const getPlanPriceList = async (parent: any, args: any, context: any, info: any) => {
  try {
    const consumerDomain = process.env.APP_CONSUMER_DOMAIN;
    const query = {
      where: {
        plan_id: parent.id,
        ...(context.origin === consumerDomain &&
          (await filterShippingZoneCountry(parent.company_id))),
        ...(context.group === 'VENDOR' && {
          plan: {
            company_id: (await getActor(context.actor)).employer_id
          }
        })
      },
      include: {
        plan: true
      }
    };

    // eslint-disable-next-line @typescript-eslint/return-await
    const planPrices = await prisma.plan_price.findMany(query);
    return planPrices;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const getPlanPriceAmountWithDiscount = async (parent: any, args: any, context: any, info: any) => {
  if (parent.plan.recurrent_discount_percent && parent.plan.recurrent_discount_percent > 0) {
    return (
      Math.round(
        (parent.amount - (parent.amount * parent.plan.recurrent_discount_percent) / 100) * 100
      ) / 100
    );
  }
  return null;
};
// Mutations

const createPlanPrice = async (parent: any, data: any, context: any, info: any) => {
  try {
    const actor = await getActor(context.actor);
    await isActorAuthorisedPlan(context, actor, data.plan_id);

    const newPlanPrice = await prisma.plan_price.create({
      data: {
        ...data,
        actor: actor.id
      }
    });
    return newPlanPrice;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const updatePlanPrice = async (parent: any, { id, ...data }: any, context: any, info: any) => {
  try {
    const actor = await getActor(context.actor);
    await isActorAuthorisedPlanPrice(context, actor, id);

    const updatedPlanPrice = await prisma.plan_price.update({
      where: {
        id
      },
      data: {
        ...data,
        actor: actor.id
      }
    });
    return updatedPlanPrice;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const deletePlanPrice = async (parent: any, { id }: any, context: any, info: any) => {
  try {
    const actor = await getActor(context.actor);
    await isActorAuthorisedPlanPrice(context, actor, id);

    const deletedPlanPrice = await prisma.plan_price.delete({
      where: {
        id
      }
    });
    return deletedPlanPrice;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

export const planPriceQueries = {
  getPlanPrice
};

export const planPriceChildren = {
  getPlanPriceList,
  getPlanPriceAmountWithDiscount
};

export const planPriceMutations = {
  createPlanPrice,
  updatePlanPrice,
  deletePlanPrice
};
