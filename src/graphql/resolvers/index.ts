/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import userResolvers from './user';
import planResolvers from './plans';

const resolvers = {
  ...userResolvers,
  ...planResolvers
};

export default resolvers;
