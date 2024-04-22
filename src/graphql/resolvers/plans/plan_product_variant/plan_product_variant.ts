import { GraphQLError } from 'graphql';
import { prisma } from '../../../services/prisma';
import { getActor, isActorAuthorised } from '../../../helpers/auth';
import { planMutations } from '../plan/plan';
import { cancelSubscription } from '../../../services/mcr-subscription';

const getPlanProductVariant = async (parent: any, data: any, context: any, info: any) => {
  try {
    const planProductVariantObject = await prisma.plan_product_variant.findUnique({
      where: {
        id: parent.id
      },
      include: {
        product_variant: true
      }
    });

    return {
      ...planProductVariantObject,
      sku: planProductVariantObject.product_variant?.sku,
      name: planProductVariantObject.product_variant?.name,
      description: planProductVariantObject.product_variant?.description
    };
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const createPlanProductVariant = async (parent: any, data: any, context: any, info: any) => {
  try {
    const plan = await prisma.plan.findUnique({
      where: {
        id: data.plan_id
      },
      include: {
        products: {
          include: {
            product_variant: true
          }
        }
      }
    });
    const actor = await getActor(context.actor);
    isActorAuthorised(context.group, actor, plan?.company_id);

    await prisma.plan_product_variant.create({
      data: {
        ...data,
        actor: actor.id
      }
    });

    const products = plan?.products?.map((products) => products.product);
    return { ...plan, products };
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const getPlanProductVariantList = async (parent: any, { id }: any, context: any, info: any) => {
  try {
    const filterDeleted = parent.status === 'INACTIVE' ? {} : { deleted: false };
    const query: any = {
      where: {
        id: parent.id
      },
      include: {
        products: {
          where: filterDeleted,
          include: {
            product_variant: true,
            plan_product_variant_price: true
          }
        }
      }
    };
    if (context.group === 'VENDOR') {
      const actor = await getActor(context.actor);
      query.where.company_id = actor.employer_id;
    }

    // eslint-disable-next-line @typescript-eslint/return-await
    const plan = await prisma.plan.findUnique(query);

    plan?.products.forEach((product) => {
      product.sku = product.product_variant?.sku;
      product.name = product.product_variant?.name;
      product.description = product.product_variant?.description;
    });

    return plan?.products;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const getProductVariantMedia = async (parent: any, { id }: any, context: any, info: any) => {
  try {
    // eslint-disable-next-line @typescript-eslint/return-await
    const productVariantMedia = await prisma.product_media.findMany({
      where: {
        product_variant_id: parent.product_variant_id
      },
      select: {
        id: true
      }
    });

    return productVariantMedia;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const deletePlanProductVariant = async (parent: any, data: any, context: any, info: any) => {
  try {
    const planProductVariant = await prisma.plan_product_variant.findFirst({
      where: {
        plan_id: data.plan_id,
        product_variant_id: data.product_variant_id
      },
      include: {
        plan: true,
        subscriptions_plans_products_variants: true
      }
    });

    const actor = await getActor(context.actor);
    isActorAuthorised(context.group, actor, planProductVariant?.plan?.company_id);

    await prisma.plan_product_variant.update({
      where: {
        id: planProductVariant.id
      },
      data: {
        deleted: true
      }
    });

    // HANDLE PLAN DELETE
    if (planProductVariant.plan.plan_type === 'BUILD_A_BOX') {
      const products = await prisma.plan_product_variant.findMany({
        where: {
          plan_id: planProductVariant.plan.id,
          deleted: false
        }
      });
      if (products.length === 0) {
        planMutations.deletePlan({}, { id: planProductVariant.plan.id }, context, info);
      } else {
        const subscriptions = planProductVariant.subscriptions_plans_products_variants.map(
          (subscriptionPlanProductVariant) => Number(subscriptionPlanProductVariant.subscription_id)
        );
        await cancelSubscription(subscriptions, context.actor);
      }
    } else {
      planMutations.deletePlan({}, { id: planProductVariant.plan.id }, context, info);
    }

    return planProductVariant.plan;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

export const planProductVariantChildren = {
  getPlanProductVariantList,
  getProductVariantMedia
};

export const planProductVariantQueries = {
  getPlanProductVariant
};

export const planProductVariantMutations = {
  createPlanProductVariant,
  deletePlanProductVariant
};
