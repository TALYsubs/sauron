import { GraphQLError } from 'graphql';
import { prisma } from '../../../services/prisma';
import { getActor } from '../../../helpers/auth';

const getTotalByUser = async (parent: any, args: any, context: any, info: any) => {
  try {
    if (!context.actor) {
      return 0;
    }

    const actor = await getActor(context.actor);

    const trial = await prisma.trial.findFirst({
      where: {
        user_id: actor.id,
        plan_id: parent.id
      }
    });

    return trial?.total ?? 0;
  } catch (error: any) {
    throw new GraphQLError(error.message ?? 'Oops! Something went wrong');
  }
};

export const trialChildren = {
  getTotalByUser
};
