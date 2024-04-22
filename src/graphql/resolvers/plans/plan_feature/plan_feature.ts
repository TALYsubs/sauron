import { GraphQLError } from 'graphql';
import { prisma } from '../../../services/prisma';
import {
  getActor,
  isActorAuthorisedPlan,
  isActorAuthorisedPlanFeature
} from '../../../helpers/auth';

// Queries
const getPlanFeature = async (parent: any, { id }: any, context: any, info: any) => {
  try {
    const query: any = {
      where: {
        id
      }
    };
    if (context.group === 'VENDOR') {
      const actor = await getActor(context.actor);
      query.include = { plan: true };
      query.where.plan.company_id = actor.employer_id;
    }
    // eslint-disable-next-line @typescript-eslint/return-await
    const planFeature = await prisma.plan_feature.findUnique(query);

    return planFeature;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const getPlanFeatureList = async (parent: any, args: any, context: any, info: any) => {
  try {
    const query: any = {
      where: {
        id: parent.id
      },
      include: {
        plan_features: true
      }
    };
    if (context.group === 'VENDOR') {
      const actor = await getActor(context.actor);
      query.where.company_id = actor.employer_id;
    }

    // eslint-disable-next-line @typescript-eslint/return-await
    const plan = await prisma.plan.findUnique(query);
    const feature = plan?.plan_features.map((feature) => feature);
    return feature;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

// Mutations

const createPlanFeature = async (parent: any, data: any, context: any, info: any) => {
  try {
    const actor = await getActor(context.actor);
    await isActorAuthorisedPlan(context, actor, data.plan_id);

    const newPlanFeature = await prisma.plan_feature.create({
      data: {
        ...data,
        actor: actor.id
      }
    });
    return newPlanFeature;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const updatePlanFeature = async (parent: any, { id, ...data }: any, context: any, info: any) => {
  try {
    const actor = await getActor(context.actor);
    await isActorAuthorisedPlanFeature(context.group, actor, id);

    const updatedPlanFeature = await prisma.plan_feature.update({
      where: {
        id
      },
      data: {
        ...data,
        actor: actor.id
      }
    });
    return updatedPlanFeature;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const deletePlanFeature = async (parent: any, { id }: any, context: any, info: any) => {
  try {
    const actor = await getActor(context.actor);
    await isActorAuthorisedPlanFeature(context.group, actor, id);

    const deletedPlanFeature = await prisma.plan_feature.delete({
      where: {
        id
      }
    });
    return deletedPlanFeature;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

// FEATURES

const createAddProductsFeature = async (parent: any, data: any, context: any, info: any) => {
  try {
    const actor = await getActor(context.actor);
    await isActorAuthorisedPlan(context, actor, data.plan_id);

    const feature = await prisma.plan_feature.create({
      data: {
        plan_id: data.plan_id,
        feature: { add_products: { ...data.input } },
        actor: actor.id
      }
    });
    return feature;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const createAddDiscountFeature = async (parent: any, data: any, context: any, info: any) => {
  try {
    const actor = await getActor(context.actor);
    await isActorAuthorisedPlan(context, actor, data.plan_id);

    const feature = await prisma.plan_feature.create({
      data: {
        plan_id: data.plan_id,
        feature: { add_discount: { ...data.input } },
        actor: actor.id
      }
    });
    return feature;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const createAddBundleDefinitionFeature = async (
  parent: any,
  data: any,
  context: any,
  info: any
) => {
  try {
    const actor = await getActor(context.actor);
    await isActorAuthorisedPlan(context, actor, data.plan_id);

    const feature = await prisma.plan_feature.create({
      data: {
        plan_id: data.plan_id,
        feature: { bundle_definition: { ...data.input } },
        actor: actor.id
      }
    });
    return feature;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const bundleDefinition = async (parent: any, data: any, context: any, info: any) => {
  const planFeature = await prisma.$queryRaw`
    SELECT * 
    FROM "plan_feature" 
    where plan_id = ${parent.id} and  "feature" ->> 'bundle_definition' IS NOT NULL;`;

  if (planFeature.length === 0) return null;

  const type = Object.keys(planFeature[0].feature)[0];
  const groupArray: any[] = [];

  if (type === 'bundle_definition') {
    const { groups } = planFeature[0].feature.bundle_definition;

    for (const group of groups) {
      const { name, quantity, products } = group;

      const productsData = await Promise.all(
        products.map((productId) => {
          return prisma.product_variant.findUnique({ where: { id: productId } });
        })
      );

      groupArray.push({ name, quantity, products: productsData });
    }
  }

  return groupArray;
};

export const planFeatureQueries = {
  getPlanFeature
};

export const planFeatureChildren = {
  getPlanFeatureList,
  bundleDefinition
};

export const planFeatureMutations = {
  createAddProductsFeature,
  createAddDiscountFeature,
  createAddBundleDefinitionFeature,
  createPlanFeature,
  updatePlanFeature,
  deletePlanFeature
};
