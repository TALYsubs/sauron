import { GraphQLError } from 'graphql';
import { prisma } from '../../../services/prisma';
// Queries
const getCategory = async (parent: any, { id, slug }: any, context: any, info: any) => {
  try {
    // eslint-disable-next-line @typescript-eslint/return-await
    if (!id && !slug) {
      throw new Error('Either id or slug must be set.');
    }
    const where = id ? { id } : { slug };
    const category = await prisma.plan_category.findUnique({
      where
    });

    return category;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const getCategoryList = async (parent: any, args: any, context: any, info: any) => {
  try {
    const allCategories = await prisma.plan_category.findMany();

    return allCategories;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

// Mutations

const createCategory = async (parent: any, data: any, context: any, info: any) => {
  try {
    const newCategory = await prisma.plan_category.create({
      data: {
        ...data
      }
    });
    return newCategory;
  } catch (error: any) {
    const PrismaClientKnownRequestError = prisma._client.constructor.PrismaClientKnownRequestError;

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new GraphQLError('Unique constraint violated', {
          extensions: {
            code: 'UNIQUE_CONSTRAINT',
            field: error.meta?.target
          }
        });
      }
    }
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const updateCategory = async (parent: any, { id, ...data }: any, context: any, info: any) => {
  try {
    const updatedCategory = await prisma.plan_category.update({
      where: {
        id
      },
      data
    });
    return updatedCategory;
  } catch (error: any) {
    const PrismaClientKnownRequestError = prisma._client.constructor.PrismaClientKnownRequestError;
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new GraphQLError('Unique constraint violated', {
          extensions: {
            code: 'UNIQUE_CONSTRAINT',
            field: error.meta?.target
          }
        });
      }
    }
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const deleteCategory = async (parent: any, { id }: any, context: any, info: any) => {
  try {
    const deletedCategory = await prisma.plan_category.delete({
      where: {
        id
      }
    });
    return deletedCategory;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

export const categoryQueries = {
  getCategory,
  getCategoryList
};

export const categoryMutations = {
  createCategory,
  updateCategory,
  deleteCategory
};
