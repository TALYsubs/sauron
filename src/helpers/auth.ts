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
    const address = await prisma.address.findUnique({ where: { id: addressId } });
    const userId = address?.user_id;
    if (group !== 'ADMIN' && actor.id.toString() !== userId?.toString())
      throw new Error('User not authorised!');
    return true;
  } catch (error: any) {
    throw new Error('IsActorAuthorisedAddress error - ' + (error.message as string));
  }
};


export const isActorAuthorisedPlan = async (group: string, actor: any, planId: bigint) => {
  try {
    const { company_id: companyId } = await prisma.plan.findUnique({ where: { id: planId } }) as any;
    return isActorAuthorised(group, actor, companyId);
  } catch (error: any) {
    throw new Error('IsActorAuthorisedPlan error - ' + (error.message as string));
  }
};


export const queryFilters = async (
  context: any,
  planIds: number[] = [],
  status: string = '',
  companyId: number = 0,
  company: any = null
) => {
  let statusFilter: any = status ? { status } : {};
  if (context.group === 'VENDOR') {
    const actor = await getActor(context.actor) as any;
    companyId = actor.employer_id;
  } else if (context.group === 'CONSUMER') {
    statusFilter = status ? { OR: [{ status }, { status: 'ACTIVE' }] } : { status: 'ACTIVE' };
    company = { published: true };
  }

  const filter = {
    ...(statusFilter ? { ...statusFilter } : {}),
    ...(planIds.length ? { id: { in: planIds } } : {}),
    ...(companyId ? { company_id: companyId } : {}),
    ...(company ? { company } : {})
  };

  return filter;
};