import { GraphQLError } from 'graphql';
import { prisma } from '../../../services/prisma';
import { checkAvailability4Address } from '../../../availability/availability';
import { getActor, isActorAuthorised, isActorAuthorisedAddress } from '../../../helpers/auth';

// Queries
const getAddress = async (parent: any, { id }: any, context: any, info: any) => {
  try {
    const { id: actorId } = await getActor(context.actor) || { id: null };
    let where: any = { id };
    if (!['VENDOR', 'ADMIN'].includes(context.group)) {
      where = { ...where, user_id: actorId };
    }

    // eslint-disable-next-line @typescript-eslint/return-await
    return await prisma.address.findUnique({ where });
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const getAddressList = async (parent: any, args: any, context: any, info: any) => {
  try {

    console.log("context.group", context);
    if (context.group !== 'ADMIN') return null; // VENDOR?
    const allAddresss = await prisma.address.findMany();

    return allAddresss;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

// Mutations

const createAddress = async (parent: any, data: any, context: any, info: any) => {
  try {
    const actor = await getActor(context.actor) || { id: null };
    isActorAuthorised(context.group, actor, data.user_id);

    const newAddress = await prisma.address.create({
      data: {
        ...data,
        actor: actor.id
      }
    });
    if (data.address_type === 'DELIVERY') {
      checkAvailability4Address(data.user_id);
    }
    return newAddress;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const updateAddress = async (parent: any, { id, ...data }: any, context: any, info: any) => {
  try {
    const actor = await getActor(context.actor) || { id: null };
    await isActorAuthorisedAddress(context.group, actor, id);

    const updatedAddress = await prisma.address.update({
      where: {
        id
      },
      data: {
        ...data,
        actor: actor.id
      }
    });
    if (data.address_type === 'DELIVERY') {
      checkAvailability4Address(data.user_id);
    }
    return updatedAddress;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

const deleteAddress = async (parent: any, { id }: any, context: any, info: any) => {
  try {
    const actor = await getActor(context.actor);
    await isActorAuthorisedAddress(context.group, actor, id);

    const deletedAddress = await prisma.address.delete({
      where: {
        id
      }
    }) as any;
    if (deletedAddress.address_type === 'DELIVERY') {
      checkAvailability4Address(deletedAddress.user_id);
    }
    return deletedAddress;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

export const addressQueries = {
  getAddress,
  getAddressList
};

export const addressMutations = {
  createAddress,
  updateAddress,
  deleteAddress
};
