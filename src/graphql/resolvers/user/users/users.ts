import { GraphQLError } from 'graphql';
import { prisma } from '../../../../services/prisma';
import fetch from 'node-fetch';
import { getActor, isActorAuthorised } from '../../../../helpers/auth';

const verify = async (parent: any, { email }: any, context: any, info: any) => {
  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (!user) {
    return {
      success: false,
      message: 'User not found'
    };
  }
  return {
    success: true,
    message: 'Email verified'
  };
};
// Queries
const getUser = async (parent: any, { id, email }: any, context: any, info: any) => {
  try {
    // Check if both id and email are undefined
    if (!id && !email) {
      throw new GraphQLError('Either id or email must be provided');
    }

    let returnUser: any = null;

    if (id && email) {
      // Use OR condition only when both id and email are provided
      returnUser = await prisma.user.findFirst({
        where: {
          OR: [{ id }, { email }]
        },
        include: {
          address: true
        }
      });
    } else if (id) {
      returnUser = await prisma.user.findUnique({
        where: { id },
        include: {
          address: true
        }
      });
    } else if (email) {
      returnUser = await prisma.user.findUnique({
        where: { email },
        include: {
          address: true
        }
      });
    }

    if (
      returnUser &&
      (returnUser.email === context.actor || ['VENDOR', 'ADMIN'].includes(context.group))
    ) {
      console.log('returned a User');
      const company = returnUser.employer_id ? { id: returnUser.employer_id } : null;
      return { ...returnUser, company, addresses: returnUser.address ?? [] };
    }

    return null;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const getUserList = async (parent: any, args: any, context: any, info: any) => {
  try {
    if (context.group !== 'ADMIN') return null; // VENDOR?
    const allUsers = await prisma.user.findMany({
      include: {
        address: true
      }
    });
    return allUsers.map((user) => ({
      ...user,
      company: user.employer_id ? { id: user.employer_id } : null,
      addresses: user.address ?? []
    }));
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

// Mutations

const createUser = async (parent: any, { input }: any, context: any, info: any) => {
  try {
    const actorId = context.actor ? (await getActor(context.actor))?.id : null;

    const newUser = await prisma.user.create({
      data: {
        ...input,
        actor: actorId
      }
    });

    if (newUser.marketing_consent) {
      const url = 'https://a.klaviyo.com/api/profiles/';
      const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          revision: '2023-10-15',
          'content-type': 'application/json',
          Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY ?? ''}`
        },
        body: JSON.stringify({
          data: {
            type: 'profile',
            attributes: {
              email: newUser.email,
              first_name: newUser.first_name,
              last_name: newUser.last_name
            }
          }
        })
      };

      await fetch(url, options);
    }

    return newUser;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const updateUser = async (parent: any, { id, input }: any, context: any, info: any) => {
  try {
    const actor = await getActor(context.actor);
    isActorAuthorised(context.group, actor, id);

    const where = context.group === 'ADMIN' ? { id } : { id, email: context.actor };
    const updatedUser = await prisma.user.update({
      where,
      data: {
        ...input,
        actor: actor?.id
      }
    });
    return updatedUser;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const subscribeToKlavyio = async (parent: any, { input }: any, context: any, info: any) => {
  try {
    const { email, source } = input;

    if (!email?.includes('@')) {
      return { error: 'Email is required and must be valid.' };
    }

    const url = 'https://a.klaviyo.com/api/profiles/';

    const data = {
      type: 'profile',
      attributes: {
        email,
        properties: {
          'Initial Source': source
        }
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY ?? ''}`,
          accept: 'application/json',
          revision: '2024-02-15',
          'content-type': 'application/json'
        },
        body: JSON.stringify({ data })
      });

      const responseJson = await response.json();

      if (responseJson.errors && responseJson.errors.length > 0) {
        return { success: false, error: responseJson.errors[0].title || 'Failed to subscribe' };
      }

      return { success: true, message: 'You are now subscribed.' };
    } catch (error) {
      return { success: false, error: 'Something went wrong on the server.' };
    }
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const deleteUser = async (parent: any, { id }: any, context: any, info: any) => {
  try {
    const actor = await getActor(context.actor);
    isActorAuthorised(context.group, actor, id);

    const deletedUser = await prisma.user.delete({
      where: {
        id
      }
    });
    return deletedUser;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

export const userQueries = {
  getUser,
  getUserList,
  verify
};

export const userMutations = {
  createUser,
  updateUser,
  deleteUser,
  subscribeToKlavyio
};
