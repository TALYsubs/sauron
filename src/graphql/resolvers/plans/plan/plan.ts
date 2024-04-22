import { GraphQLError } from 'graphql';
import { prisma } from '@services/prisma';
import {
  getActor,
  isActorAuthorised,
  isActorAuthorisedPlan,
  queryFilters
} from '@helpers/auth';
import {
  bcorpCriteria,
  commonFilter,
  nearToStoreCriteria,
  nearToUserCriteria,
  newToTalyCriteria,
  recommendedCriteria,
  specialCriteria,
  topRatedCriteria
} from '@helpers/sections';
import { PlanSection, SpecialFilter, Template } from 'plans';
import fs from 'fs';
import path from 'path';
import {
  buildCreatePlanQueries,
  buildPlanBasedOnProductAndVariant,
  getProductAndVariantByVariantIds,
  processTemplate,
  processUpdatePlanFeaturesData,
  processUpdatePlanProductVariantData,
  updatePlanPricesPayload,
  validateInput
} from '@services/planServices';
import { cancelSubscription } from '@services/mcr-subscription';

// Queries
const getPlan = async (parent: any, { id, slug }: any, context: any, info: any) => {
  try {
    const filters = queryFilters(context);
    if (!id && !slug) {
      throw new Error('Either id or slug must be set.');
    }

    const where = id ? { id, ...filters } : { slug, ...filters }; // id has priority, then slug
    const plan = await prisma.plan.findUnique({
      where,
      include: {
        category: true,
        company: {
          include: {
            company_media: true,
          },
        },
      }
    });

    // transform company.company_media to company.media
    if (plan?.company) {
      plan.company.media = plan.company.company_media.map((media: any) => media) || [];
    }

    return plan;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const getPlanList = async (
  parent: any,
  { companyId, status, planIds, userLocation }: any,
  context: any,
  info: any
) => {
  try {
    const where = await queryFilters(context, planIds, status, companyId);

    const productVariantPriceFilter = userLocation
      ? {
        products: {
          some: {
            plan_product_variant_price: {
              some: {
                country: userLocation
              }
            }
          }
        }
      }
      : {};

    const finalWhereClause = {
      ...where,
      ...productVariantPriceFilter
    };

    const allPlans = await prisma.plan.findMany({
      where: finalWhereClause,
      include: {
        category: true,
        company: true
      }
    });

    return allPlans;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const getWorkflowData = async (parent: any, { id }: any, context: any, info: any) => {
  try {
    const jsonData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'workflowData.json'), 'utf-8')
    );
    return {
      data: jsonData
    };
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const getPlanSectionList = async (
  parent: any,
  {
    page,
    size,
    userLocation,
    filters,
    categories
  }: { page: number; size: number; userLocation?: any; filters: any; categories?: any },
  context: any,
  info: any
): Promise<any> => {
  if (size <= 0) {
    throw new Error('Size must be a positive integer');
  }

  try {
    const companyIds = await commonFilter(prisma, userLocation); // Cache result

    const processSection = async (section: any) => {
      const result = await section.criteria(
        prisma,
        userLocation,
        page,
        size,
        categories,
        companyIds
      ); // Pass companyIds
      const totalPages = Number.isInteger(result.totalPages) ? result.totalPages : 0; // Ensure totalPages is an integer
      return { title: section.title, type: section.type, items: result.items, totalPages };
    };

    const DEFAULT_SECTIONS: PlanSection[] = [
      { title: 'Top Picks', type: 'plan', criteria: nearToUserCriteria },
      { title: 'Stores', type: 'business', criteria: nearToStoreCriteria },
      { title: 'New on Taly', type: 'plan', criteria: newToTalyCriteria },
      { title: 'Special', type: 'plan', criteria: specialCriteria }
    ];

    const SPECIAL_FILTERS: SpecialFilter = {
      recommended: { type: 'plan', criteria: recommendedCriteria },
      top_rated: { type: 'plan', criteria: topRatedCriteria },
      bcorp: { type: 'plan', criteria: bcorpCriteria }
    };

    if (Object.keys(filters).some((filter) => filters[filter])) {
      const specialFilter = Object.keys(filters).find((filter) => filters[filter]);
      if (specialFilter && SPECIAL_FILTERS[specialFilter]) {
        const section = SPECIAL_FILTERS[specialFilter];
        // Now you can safely use `section`
        const result = await processSection(section);
        return { sections: [result], doc: { page, size, totalPages: result.totalPages } };
      }
    }

    const sections = await Promise.all(
      DEFAULT_SECTIONS.map(async (section) => await processSection(section))
    );
    const totalPages = Math.max(...sections.map((s) => s.totalPages), 0); // Ensure at least 0

    return { sections, doc: { page, size, totalPages } };
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const getPlanListForUser = async (parent: any, { userId }: any, context: any, info: any) => {
  try {
    if (context.group === 'VENDOR') throw new Error('User not authorised!');
    if (context.group === 'CONSUMER') {
      await getActor(context.actor) as any;
    }
    if (!userId) return null;



    const allRecords = await prisma.availability.findMany({
      where: {
        user_id: userId,
        company: {
          published: true,
          plans: {
            status: 'ACTIVE'
          }
        }
      },
      include: {
        company: {
          include: {
            plans: true
          }
        }
      }
    }) || [];
    return allRecords.flatMap((availability) => availability.company.plans);
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const createPlan = async (parent: any, { input }: any, context: any, info: any) => {
  try {
    const actor = await getActor(context.actor);
    isActorAuthorised(context.group, actor, input.company_id);

    const planQueries = await buildCreatePlanQueries([input], actor);
    if (!planQueries.length) {
      throw new Error('Oops! Something went wrong with your plan data.');
    }
    return await prisma.plan.create(planQueries[0]);
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const createPlanBulk = async (parent: any, { input }: any, context: any, info: any) => {
  try {
    const actor = await getActor(context.actor);
    isActorAuthorised(context.group, actor, input.company_id);

    const variantIds: number[] = [];
    const variantQuantities: Record<number, number> = {};

    input.products.map((item: { id: number; quantity: number }) => {
      variantIds.push(item.id);
      variantQuantities[item.id] = item.quantity;
      return true;
    });

    const productAndVariants = await getProductAndVariantByVariantIds(variantIds) || [];

    const plans = buildPlanBasedOnProductAndVariant(productAndVariants, variantQuantities, input);

    const planQueries = await buildCreatePlanQueries(plans, actor, true);

    if (!planQueries.length) {
      throw new Error('Oops! Something went wrong with your plan data.');
    }

    return await Promise.all(
      planQueries.map((item) => {
        return prisma.plan.create(item);
      })
    );
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const updatePlan = async (parent: any, { input }: any, context: any, info: any) => {
  try {
    const planData = { ...input };
    await validateInput(planData);

    const actor = await getActor(context.actor) as any;
    isActorAuthorised(context.group, actor, input.company_id);

    const template: Template = await processTemplate(planData.plan_type, input, actor);
    planData.products = await processUpdatePlanProductVariantData(input, actor.id);
    planData.plan_features = await processUpdatePlanFeaturesData(input);
    delete planData.bundle_definition;
    delete planData.plan_price;

    const updatedPlan = await prisma.plan.update({
      where: {
        id: input.id
      },
      data: {
        ...planData,
        ...template,
        actor: actor.id
      }
    });
    return updatedPlan;
  } catch (error: any) {
    console.log(error);

    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

// INTERNAL
const updatePlanPrices = async (parent: any, data: any, context: any, info: any) => {
  try {
    if (context.group !== 'ADMIN') throw new Error('Not authorised!');
    const plans = await prisma.plan.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        products: true
      }
    });

    const promises = plans.map(async (plan) => {
      try {
        await updatePlanPricesPayload(plan);
        return null;
      } catch (error: any) {
        return { id: plan.id, error: error.message ?? 'ERROR' };
      }
    });

    const result = await Promise.all(promises);
    return { success: true, errors: result.filter(Boolean) };
  } catch (error: any) {
    return { success: false, error };
  }
};

const deletePlan = async (parent: any, { id }: any, context: any, info: any) => {
  try {
    const actor = await getActor(context.actor);
    isActorAuthorisedPlan(context.group, actor, id);

    const deletedPlan = await prisma.plan.update({
      where: {
        id
      },
      data: {
        status: 'INACTIVE',
        deleted: true
      },
      include: {
        subscriptions: true
      }
    });

    // CANCEL SUBSCRIPTIONS
    const subscriptions = deletedPlan.subscriptions.map((subscription) => Number(subscription.id));

    await cancelSubscription(subscriptions, context.actor);

    return deletedPlan;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

export const planQueries = {
  getPlan,
  getPlanList,
  getPlanSectionList,
  getPlanListForUser,
  getWorkflowData
};

export const planMutations = {
  createPlan,
  updatePlan,
  updatePlanPrices,
  deletePlan,
  createPlanBulk
};
