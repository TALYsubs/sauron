import { generateSlug } from '@helpers/slug';
import { GroupedPrice, PlanDTO, Template } from 'plans';
import { prisma } from './prisma';
import { GraphQLError } from 'graphql';

// return nested query to prisma
export const processUpdatePlanPriceData = async (input, actor) => {
  try {
    if (input.plan_price) {
      const planPrices = await prisma.plan_price.findMany({
        where: {
          plan_id: input.id
        }
      });

      const planPriceCreate = input.plan_price.filter((price) => !price.id);
      const deleteIds = planPrices
        .filter(
          (existingPrice) =>
            !input.plan_price.some((price) => price.id && BigInt(price.id) === existingPrice.id)
        )
        .map((price) => BigInt(price.id));
      const planPriceUpdate = input.plan_price
        .filter(
          (price) =>
            price.id && planPrices.some((existingPrice) => BigInt(price.id) === existingPrice.id)
        )
        .map((price) => {
          return price;
        });
      const createQuery = {
        create: await Promise.all(
          planPriceCreate.map(async (price) => {
            const priceData = {
              currency: price.currency,
              country: price.country,
              amount: price.amount,
              actor
            };

            return priceData;
          })
        )
      };

      const updateQuery = {
        update: await Promise.all(
          planPriceUpdate.map(async (price) => {
            const priceData = {
              where: {
                id: price.id
              },
              data: {
                currency: price.currency,
                country: price.country,
                amount: price.amount,
                actor
              }
            };

            return priceData;
          })
        )
      };

      await prisma.plan_price.deleteMany({
        where: {
          id: {
            in: deleteIds
          }
        }
      });

      return {
        ...createQuery,
        ...updateQuery
      };
    }
    return { create: [] };
  } catch (error) {
    console.log(error);
    throw new GraphQLError('Process plan product variant data error');
  }
};

export const processPlanPriceData = async (input, actor) => {
  try {
    if (input.plan_price) {
      return {
        create: await Promise.all(
          input.plan_price.map(async (price) => {
            const priceData = {
              currency: price.currency,
              country: price.country,
              amount: price.amount,
              actor
            };

            return priceData;
          })
        )
      };
    }
    return { create: [] };
  } catch (error) {
    console.log(error);
    throw new GraphQLError('Process plan product variant data error');
  }
};

export const processPlanProductVariantData = async (input, actor) => {
  try {
    if (input.products) {
      return {
        create: await Promise.all(
          input.products.map(async (productVariant) => {
            const planProductVariantData = {
              product_variant_id: productVariant.id,
              actor,
              quantity: productVariant.quantity,
              plan_product_variant_price: {}
            };
            const planProductVariantPrice = await prisma.product_variant_price.findMany({
              where: {
                product_variant_id: productVariant.id
              }
            });
            if (planProductVariantPrice) {
              planProductVariantData.plan_product_variant_price = {
                create: planProductVariantPrice.map((price) => {
                  return {
                    country: price.country,
                    currency: price.currency,
                    amount: price.amount
                  };
                })
              };
            }
            return planProductVariantData;
          })
        )
      };
    }
    return { create: [] };
  } catch (error) {
    console.log(error);
    throw new GraphQLError('Process plan product variant data error');
  }
};

export const processPlanFeaturesData = async (input) => {
  try {
    if (input.bundle_definition) {
      return {
        create: { feature: { bundle_definition: { ...input.bundle_definition } } }
      };
    }
    return { create: [] };
  } catch (error) {
    console.log(error);
    throw new GraphQLError('Process plan product variant data error');
  }
};

export const processUpdatePlanFeaturesData = async (input) => {
  try {
    if (input.bundle_definition) {
      const planFeature = await prisma.$queryRaw`
        SELECT * 
        FROM "plan_feature" 
        where plan_id = ${input.id} and  "feature" ->> 'bundle_definition' IS NOT NULL;` as any;

      if (planFeature.length > 0) {
        return {
          update: {
            where: {
              id: planFeature[0].id
            },
            data: { feature: { bundle_definition: { ...input.bundle_definition } } }
          }
        };
      }

      return {
        create: { feature: { bundle_definition: { ...input.bundle_definition } } }
      };
    }
    return { create: [] };
  } catch (error) {
    console.log(error);
    throw new GraphQLError('Process plan product variant data error');
  }
};

export const processUpdatePlanProductVariantData = async (input, actor) => {
  try {
    if (input.products) {
      const planProductVariant = await prisma.plan_product_variant.findMany({
        where: {
          plan_id: input.id
        },
        select: {
          product_variant_id: true
        }
      });
      const inputVariantsIds = input.products.map((product) => product.id);
      const productVariantIds = planProductVariant.map(
        (planProduct) => planProduct.product_variant_id
      );
      const deleteIds = productVariantIds.filter(
        (product) => !inputVariantsIds.includes(parseInt(product.toString()))
      );
      const deleteQuery =
        deleteIds.length > 0
          ? {
            deleteMany: deleteIds.map((productVariantId) => {
              return { product_variant_id: productVariantId, plan_id: input.id };
            })
          }
          : {};
      const createQuery = {
        create: await Promise.all(
          input.products.map(async (productVariant) => {
            // RETURN IF ALREADY EXISTS
            if (productVariantIds.includes(BigInt(productVariant.id))) return null;
            const planProductVariantData = {
              product_variant_id: productVariant.id,
              actor,
              quantity: productVariant.quantity,
              plan_product_variant_price: {}
            };
            const planProductVariantPrice = await prisma.product_variant_price.findMany({
              where: {
                product_variant_id: productVariant.id
              }
            });
            if (planProductVariantPrice) {
              planProductVariantData.plan_product_variant_price = {
                create: planProductVariantPrice.map((price) => {
                  return {
                    country: price.country,
                    currency: price.currency,
                    amount: price.amount
                  };
                })
              };
            }
            return planProductVariantData;
          })
        )
      };

      const updateQuery = {
        update: await Promise.all(
          input.products.map(async (productVariant) => {
            if (productVariantIds.includes(BigInt(productVariant.id))) {
              const planProductVariantData = {
                product_variant_id: productVariant.id,
                actor,
                quantity: productVariant.quantity
              };
              const planProductVariantId = await prisma.plan_product_variant.findFirst({
                where: {
                  plan_id: input.id,
                  product_variant_id: productVariant.id
                },
                select: {
                  id: true
                }
              }) as any;
              return { where: { id: planProductVariantId.id }, data: planProductVariantData };
            }
            return null;
          })
        )
      };

      updateQuery.update = updateQuery.update.filter(Boolean);
      createQuery.create = createQuery.create.filter(Boolean);
      return {
        ...createQuery,
        ...deleteQuery,
        ...updateQuery
      };
    }
    return { create: [] };
  } catch (error) {
    console.log(error);
    throw new GraphQLError('Process plan product variant data error');
  }
};

export const processPlanPriceFromProducts = async (input: any, actor) => {
  if (!input.products) return { create: [] };
  await validateProductCountryCurrencyPrice(input.products.map((product) => product.id));
  const prices = await calculateTotalPrices(input.products);
  if (input.id) {
    const planPrices = await prisma.plan_price.findMany({
      where: {
        plan_id: input.id
      }
    });

    const pricesUpdate = prices.map((price) => {
      const exists = planPrices.find(
        (existingPrice) =>
          existingPrice.currency === price.currency && existingPrice.country === price.country
      );
      if (exists) return { ...price, id: exists.id };
      return price;
    });
    input.plan_price = pricesUpdate;
    return await processUpdatePlanPriceData(input, actor);
  } else {
    input.plan_price = prices;
    return await processPlanPriceData(input, actor);
  }
};

const updatePlanProductVariantPrice = async (plan) => {
  for (const variant of plan.products) {
    const productVariant = await prisma.product_variant.findUnique({
      where: {
        id: variant.product_variant_id
      },
      include: {
        product_variant_price: true
      }
    }) as any;
    const { id } = variant;
    for (const price of productVariant.product_variant_price) {
      const { country, currency, amount: newAmount } = price;
      const planProductVariantPrice = await prisma.plan_product_variant_price.findFirst({
        where: {
          plan_product_variant_id: id,
          country,
          currency
        }
      });

      if (planProductVariantPrice) {
        await prisma.plan_product_variant_price.update({
          where: { id: planProductVariantPrice.id },
          data: { amount: newAmount }
        });
      } else {
        await prisma.plan_product_variant_price.create({
          data: {
            plan_product_variant_id: id,
            country,
            currency,
            amount: newAmount
          }
        });
      }
    }
  }
};

export const updatePlanPricesPayload = async (plan) => {
  // UPDATE PLAN PRODUCT VARIANT PRICE
  await updatePlanProductVariantPrice(plan);

  // UPDATE PLAN PRICE FROM PRODUCTS
  if (plan.plan_type === 'STANDARD') {
    const input = {
      id: plan.id,
      products:
        plan.products.map((product) => {
          return { id: product.product_variant_id, quantity: product.quantity };
        }) ?? null
    };
    const planPrice = await processPlanPriceFromProducts(input, plan.actor);
    await prisma.plan.update({
      where: {
        id: plan.id
      },
      data: {
        plan_price: { ...planPrice }
      }
    });
  }
  return true;
};

/**
 * Calculate total prices based on product_variant_price.
 *
 * @param {any[]} products - array of {id, quantity}
 * @return {Promise<void>} - plan_price (currency, country, amount)
 */
export const calculateTotalPrices = async (products: any[]) => {
  const groupedPrices: Record<string, GroupedPrice> = {};

  for (const product of products) {
    const productPrices = await prisma.product_variant_price.findMany({
      where: {
        product_variant_id: product.id
      }
    });

    for (const price of productPrices) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const key = `${price.country}-${price.currency}`;
      if (groupedPrices[key]) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        groupedPrices[key].amount += price.amount * product.quantity;
      } else {
        groupedPrices[key] = {
          country: price.country,
          currency: price.currency,
          amount: price.amount * product.quantity
        };
      }
    }
  }

  return Object.values(groupedPrices);
};

export const validateInput = async (input) => {
  if (input.plan_type === 'BUNDLE') {
    if (!input.bundle_definition) {
      throw new GraphQLError('The bundle_definition is required for BUNDLE plans!');
    }

    if (!input.plan_price) {
      throw new GraphQLError('Plan price is required for BUNDLE plans!');
    }
  }
};

export const validateProductCountryCurrencyPrice = async (productIds: number[]) => {
  const groupBy = await prisma.product_variant_price.groupBy({
    by: ['currency', 'country'],
    where: {
      product_variant_id: { in: productIds }
    },
    _count: {
      id: true
    }
  });
  const hasSameCurrencyCountryPrices =
    groupBy.length > 0 && groupBy.every((item) => item._count.id === groupBy[0]._count.id);
  if (!hasSameCurrencyCountryPrices)
    throw new GraphQLError(
      'There are products without value mapped to the all country and currency'
    );
};

export const getProductAndVariantByVariantIds = async (variantIds: number[]) => {
  try {
    const result = await prisma.product_variant.findMany({
      where: {
        id: {
          in: variantIds
        }
      },
      include: {
        media: true,
        product: {
          include: {
            media: true
          }
        }
      }
    });
    return result;
  } catch (error: any) {
    console.error('Error on buildPlanBasedOnVariant ', error);
  }
};

export const buildPlanBasedOnProductAndVariant = (
  variants: any[],
  productsQuantity: Record<number, number>,
  extraDetailsPlan?: object
) => {
  const getFirstValidMedia = (medias?: any[]) => {
    if (!medias) return null;
    const productMedia = medias?.find((productMedia) => {
      return productMedia.media;
    });
    return productMedia?.media ?? null;
  };

  return variants.map((variant: any) => {
    let title = variant?.product?.name ?? '';
    if (variant?.name) {
      title += title ? ' - ' + variant?.name : variant.name;
    }

    return {
      title,
      description: variant.description_long ?? variant?.product?.description,
      media_cover:
        getFirstValidMedia(variant?.media) ?? getFirstValidMedia(variant?.product?.media),
      ...extraDetailsPlan,
      products: [{ id: variant.id, quantity: productsQuantity[variant.id] ?? 1 }]
    };
  });
};

export const buildCreatePlanQueries = async (
  inputs: PlanDTO[],
  actor: any,
  skipOnError = false
) => {
  const tmpSlugs: string[] = [];
  const queries: any[] = [];

  for (const input of inputs) {
    try {
      await validateInput(input);
      const slug = await generateSlug(input.title, tmpSlugs);
      tmpSlugs.push(slug);

      queries.push({
        data: {
          ...input,
          slug,
          products: await processPlanProductVariantData(input, actor.id),
          plan_features: await processPlanFeaturesData(input),
          ...(await processTemplate(input.plan_type, input, actor)),
          actor: actor.id
        }
      });
    } catch (error) {
      if (!skipOnError) {
        throw error;
      }
    }
  }

  return queries;
};

export const processTemplate = async (type: string, input: any, actor: any) => {
  const template: Template = {};

  switch (type) {
    case 'BUILD_A_BOX':
      template.product_selection = 'DYNAMIC';
      template.pricing_type = 'DYNAMIC';
      break;
    case 'BUNDLE':
      template.product_selection = 'DYNAMIC';
      template.pricing_type = 'FIXED';
      template.plan_price = input.id
        ? await processUpdatePlanPriceData(input, actor.id)
        : await processPlanPriceData(input, actor.id);
      break;
    case 'TRIAL':
      template.product_selection = 'FIXED';
      template.pricing_type = 'FIXED';
      template.plan_price = await processPlanPriceFromProducts(input, actor.id);
      // REQUIRES DEFINITION OF PLAN FEATURES
      // plan feature must define that there are no renewals
      // we might need a field one_per_customer (boolean) or number_per_customer (integer)
      break;
    case 'START_REFILL':
      // REQUIRES DEFINITION OF PLAN FEATURES
      // plan feature must define that first sale includes a product and maybe some refils
      // the remaining renewals will be done with the basic definition of the plan
      // example:
      // template.plan_feature = '{add_product: { product_id: xyz, other_stuf: other_stuff_settings}}'
      break;
    default:
      // standard basic plan
      template.product_selection = 'FIXED';
      template.pricing_type = 'FIXED';
      template.plan_price = await processPlanPriceFromProducts(input, actor.id);
      break;
  }
  return template;
};
