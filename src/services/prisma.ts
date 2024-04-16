import { PrismaClient } from '@prisma/client';
import media from './prisma_extensions/media';
const prisma = new PrismaClient().$extends(media);



export { prisma };
