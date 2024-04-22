/* eslint-disable @typescript-eslint/restrict-template-expressions */

const requestPlan = async (page, size, prisma, where) => {
  const plans = await prisma.plan.findMany({
    where,
    include: {
      company: {
        include: {
          company_media: true
        }
      },
      products: true,
      plan_price: true,
      plan_features: true,
      category: true
    },
    skip: (page - 1) * size,
    take: size
  });

  plans.forEach((plan) => {
    plan.company.media = plan.company.company_media.map((media: any) => media);
  });

  return plans;
};

export const commonFilter = async (prisma, userLocation) => {
  const matchingZones = await prisma.shipping_zone.findMany({
    select: {
      company_id: true,
      company: {
        select: {
          id: true
        }
      }
    },
    where: {
      country: userLocation,
      company: {
        type: 'VENDOR',
        published: true
      }
    }
  });

  // Check for undefined or null matchingZones before calling map
  if (!matchingZones) {
    console.error(`matchingZones is undefined or null at location: ${userLocation}`);
    return [];
  }

  return matchingZones.map((zone) => zone.company_id);
};

export const nearToUserCriteria = async (prisma, userLocation, page, size, categories) => {
  try {
    const categoryFilter =
      categories && categories.length > 0 ? { category_id: { in: categories } } : {};

    const companyIds = await commonFilter(prisma, userLocation);

    const where = {
      company_id: {
        in: companyIds
      },
      status: 'ACTIVE',
      company: {
        published: true
      },
      products: {
        // Navigates from plan to plan_product_variant
        some: {
          plan_product_variant_price: {
            // Navigates from plan_product_variant to plan_product_variant_price
            some: {
              country: userLocation
            }
          }
        }
      },
      ...categoryFilter
    };

    // RANDOMISE TOP SECTION (86944x8bt)
    const plansIds = (
      await prisma.plan.findMany({
        where,
        select: {
          id: true
        }
      })
    ).map((plan) => plan.id);
    const sortedIds = plansIds.sort(() => Math.random() - 0.5).slice(0, size);

    // Fetch plans associated with those companies
    const plans = await requestPlan(page, size, prisma, { ...where, id: { in: sortedIds } });
    const count = plans.length;
    const totalPages = Math.ceil(count / size);

    return { items: plans.sort(() => Math.random() - 0.5), totalPages };
  } catch (error: any) {
    console.error('Oops! Something went wrong on nearToUserCriteria:', error.message);
    throw new Error(error.message ?? 'Oops! Something went wrong on nearToUserCriteria');
  }
};

export const newToTalyCriteria = async (prisma, userLocation, page, size, categories) => {
  try {
    // Sample criteria for fetching plans that are new to Taly
    // For this to work, you'd need some sort of timestamp or flag in the schema
    // to identify which plans are new.
    const categoryFilter =
      categories && categories.length > 0 ? { category_id: { in: categories } } : {};

    const companyIds = await commonFilter(prisma, userLocation);

    const where = {
      company_id: {
        in: companyIds
      },
      status: 'ACTIVE',
      company: {
        published: true
      },
      products: {
        // Navigates from plan to plan_product_variant
        some: {
          plan_product_variant_price: {
            // Navigates from plan_product_variant to plan_product_variant_price
            some: {
              country: userLocation
            }
          }
        }
      },
      ...categoryFilter
    };

    const result = await requestPlan(page, size, prisma, where);

    if (result?.company) {
      result.company.media = result.company.company_media.map((media: any) => media);
    }

    const count = result.length;
    const totalPages = Math.ceil(count / size);

    return { items: result, totalPages };
  } catch (error: any) {
    console.error('Oops! Something went wrong on newToTalyCriteria');
    throw new Error(error.message ?? 'Oops! Something went wrong on newToTalyCriteria');
  }
};

export const specialCriteria = async (prisma, userLocation, page, size, categories) => {
  try {
    // Sample criteria for fetching plans that have promotions

    const categoryFilter =
      categories && categories.length > 0 ? { category_id: { in: categories } } : {};

    const companyIds = await commonFilter(prisma, userLocation);

    const where = {
      voucher: true,
      company_id: {
        in: companyIds
      },
      status: 'ACTIVE',
      company: {
        published: true
      },
      products: {
        // Navigates from plan to plan_product_variant
        some: {
          plan_product_variant_price: {
            // Navigates from plan_product_variant to plan_product_variant_price
            some: {
              country: userLocation
            }
          }
        }
      },
      ...categoryFilter
    };

    const result = await requestPlan(page, size, prisma, where);

    const count = result.length;
    const totalPages = Math.ceil(count / size);

    return { items: result, totalPages };
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message ?? 'Oops! Something went wrong on specialCriteria');
  }
};

export const nearToStoreCriteria = async (prisma, userLocation, page, size, categories) => {
  try {
    const categoryFilter =
      categories && categories.length > 0
        ? {
            plans: {
              some: {
                category_id: {
                  in: categories
                },
                status: 'ACTIVE' // Ensuring only active plans are considered
              }
            }
          }
        : {};

    const where = {
      type: 'VENDOR',
      published: true,
      ...categoryFilter
    };

    // Sample criteria for fetching plans based on stores near the user
    const result = await prisma.company.findMany({
      where,
      include: {
        shipping_zone: {
          where: {
            country: userLocation
          }
        },
        company_media: true
      },
      skip: (page - 1) * size,
      take: size
    });

    if (result.length > 0) {
      result.forEach((company: any) => {
        company.media = company.company_media.map((media: any) => media);
      });
    }

    const count = result.length;
    const totalPages = Math.ceil(count / size);

    return { items: result, totalPages };
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message ?? 'Oops! Something went wrong on nearToStoreCriteria');
  }
};

export const recommendedCriteria = async (prisma, userLocation, page, size, categories) => {
  // ... logic for fetching recommended plans ...
  throw new Error('Not implmented yet');
};

export const topRatedCriteria = async (prisma, userLocation, page, size, categories) => {
  // ... logic for fetching top rated plans ...
  throw new Error('Not implmented yet');
};

export const bcorpCriteria = async (prisma, userLocation, page, size, categories) => {
  // ... logic for fetching BCorp plans ...
  throw new Error('Not implmented yet');
};
