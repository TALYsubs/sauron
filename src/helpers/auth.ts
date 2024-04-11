import { prisma } from '../services/prisma';

export const getActor = async (email: string) => {
  try {
    const actor = await prisma.user.findUnique({ where: { email } });
    if (!actor) {
      console.log('Actor not found');
      return null;
    }
    return actor;
  } catch (error: any) {
    throw new Error('Get actor error');
  }
};

export const isActorAuthorised = (group: string, actor: any, userId: bigint) => {
  try {
    if (group !== 'ADMIN' && actor.id.toString() !== userId.toString())
      throw new Error('User not authorised!');
    return true;
  } catch (error: any) {
    throw new Error('IsActorAuthorised error');
  }
};

export const isActorAuthorisedAddress = async (group: string, actor: any, addressId: bigint) => {
  try {
    const { user_id: userId } = await prisma.address.findUnique({ where: { id: addressId } });
    if (group !== 'ADMIN' && actor.id.toString() !== userId.toString())
      throw new Error('User not authorised!');
    return true;
  } catch (error: any) {
    throw new Error('IsActorAuthorisedAddress error - ' + (error.message as string));
  }
};
