import { request, gql } from 'graphql-request';

const MCR_SUBSCRIPTION_ENDPOINT = process.env.MCR_SUBSCRIPTION_ENDPOINT as string;

const cancelSubscriptionMutation = gql`
  mutation Mutation($subscriptions: [BigInt]!) {
    cancelSubscription(subscriptions: $subscriptions) {
      id
    }
  }
`;

export const cancelSubscription = async (subscriptions: any, actor: string): Promise<any> => {
  try {
    const { cancelSubscription } = (await request(
      MCR_SUBSCRIPTION_ENDPOINT,
      cancelSubscriptionMutation,
      { subscriptions },
      { group: 'ADMIN', actor }
    )) as any;
    return cancelSubscription;
  } catch (error) {
    console.log('Error on cancelSubscription: ', error);
    return { error: (error as any).message ?? '', success: false };
  }
};
