import { createContext, PrismaClient } from '@taly-eir/taly-prisma';

let prisma: PrismaClient;

async function createPrismaInstance() {
  const context = await createContext({});
  prisma = context.prisma;
}

createPrismaInstance();

export { prisma };
